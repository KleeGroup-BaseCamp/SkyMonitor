package skymonitor.airwayloader;

import java.io.File;
import java.io.IOException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.HashMap;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.Mongo;
import com.mongodb.MongoException;

/**
 * Classe responsable du chargement de la base de données des routes.
 * 
 * Utilise 3 fichiers d'entrée :
 * - Airways.xml (nom et identifant)
 * - AirwayLegs.xml (segment d'une route; 2 points consécutifs)
 * - Waypoints.xml (nom et coordonnées des points)
 *  
 * ATTENTION ; les routes peuvent avoir un sens :
 * - certains des legs marquent des débuts et d'autres des fins de route
 * - certains segments de route pouvant être parcourus dans les 2 sens seront présents 2 fois en base de données.
 * Exemple :
 * - en France (carte https://www.sia.aviation-civile.gouv.fr/aip/enligne/PDF_AIPparSSection/AIP%20FRANCE/ENR/6/1313_ENR-6.2.pdf)
 * - dans la région de Tours, la route UN858 (globalement Sud -> Nord) peut être parcouru en Nord -> Sud sur les 2 segments VANAD -> DEVRO -> BOKNO
 * - les 2 segments sont donc en double dans la base de données (une entrée dans chaque sens).
 *  
 * Stockage en base de données :
 * - Dans la base de données "skymonitor"
 * - Dans la collection "AirWays"
 * - 1 document par route incluant :
 * 		- le nom de la route,
 * 		- la route au format GeoJSON 
 * - pour chaque segments :
 * 		- le nom du point de début
 * 		- le nom du point de fin
 * 		- le sens :
 * 			- "1"  : parcours de "From" vers "To" 
 * 			- "0"  : parcours de "From" vers "To" et de "To" vers "From"
 * 			- "-1" : parcours de "To" vers "From"
 * 		- le segment au format GeoJSON
 * - Exemple (la route et les points sont réels, les coordonnées sont fictives) :
 * 	{ 
 * 		Ident: "UN858",
 * 		Legs: [
 * 			{ From: "LUTAX", To: "MEDOX", Dir: -1, Line: { type: "LineString", coordinates : [ [40, 5], [41, 6] ] } },
 * 			{ From: "MEDOX", To: "RANUX", Dir: -1, Line: { type: "LineString", coordinates : [ [41, 6], [42, 6] ] } },
 * 			{ From: "RANUX", To: "UTELA", Dir: -1, Line: { type: "LineString", coordinates : [ [42, 6], [43, 6] ] } },
 * 			{ From: "UTELA", To: "TSU",   Dir: -1, Line: { type: "LineString", coordinates : [ [43, 6], [44, 6] ] } },
 * 			{ From: "TSU",   To: "TABOV", Dir: -1, Line: { type: "LineString", coordinates : [ [44, 6], [45, 6] ] } },
 * 			{ From: "TABOV", To: "VANAD", Dir: -1, Line: { type: "LineString", coordinates : [ [45, 6], [46, 6] ] } },
 * 			{ From: "VANAD", To: "DEVRO", Dir: 0,  Line: { type: "LineString", coordinates : [ [46, 6], [47, 6] ] } },
 * 			{ From: "DEVRO", To: "BOKNO", Dir: 0,  Line: { type: "LineString", coordinates : [ [47, 6], [48, 6] ] } },
 * 			{ From: "BOKNO", To: "ADABI", Dir: -1, Line: { type: "LineString", coordinates : [ [48, 6], [49, 6] ] } },
 * 			{ From: "ADABI", To: "CNA",   Dir: -1, Line: { type: "LineString", coordinates : [ [49, 6], [50, 6] ] } },
 * 		],
 * 		Route: { type: "LineString", coordinates : [ [40, 5], [41, 6], [42, 6], [43, 6], [44, 6], [45, 6], [46, 6], [47, 6], [48, 6], [49, 6], [50, 6] ] }
 *  }
 */
public class Airways {
	
	/**
	 * Liste des legs dans le fichier d'entrée.
	 */
	private static NodeList legsList;
	
	/**
	 * HashMap indiquant la position, dans legsList, du premier legs d'une airway à partir de l'identifiant de l'airway.
	 */
	private static HashMap<Integer, Integer> legsIndex;
	
	/**
	 * HashMap retourne le waypoint à partir de son identifiant.
	 */
	private static HashMap<Integer, Element> waypointsIndex;

	public static void main(String[] args) {
		String mongoServer = "localhost";
		String mongoDatabase = "skymonitor";
		String mongoAirways = "AirWays";
		
		String legsFilename = "C:/Users/Compaq/Desktop/AirwayLegs.xml";
		String airwaysFilename = "C:/Users/Compaq/Desktop/Airways.xml";
		String waypointsFilename = "C:/Users/Compaq/Desktop/Waypoints.xml";

		try {
			Mongo mongo = new Mongo(mongoServer, 27017);
			DB db = mongo.getDB(mongoDatabase);

			DBCollection collection = db.getCollection(mongoAirways);

			// Load input files.
			legsList = loadAirwayLegs(legsFilename);
			NodeList airwaysList = loadAirways(airwaysFilename);
			NodeList waypointsList = loadWaypoints(waypointsFilename);

			// Build index for legs and waypoints.
			legsIndex = indexLegs(legsList);
			waypointsIndex = indexWaypoints(waypointsList);

			// Create a new MongoDB document for each airway.
			for (int i = 0; i < airwaysList.getLength(); i++) {
				Node airwayNode = airwaysList.item(i);

				if (airwayNode.getNodeType() == Node.ELEMENT_NODE) {
					Element airwayElement = (Element) airwayNode;

					BasicDBObject document = createAirwayDocument(airwayElement);
					collection.insert(document);
					System.out.println(document);
				}
			}
		} catch (UnknownHostException e) {
			e.printStackTrace();
		} catch (MongoException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static BasicDBObject createAirwayDocument(Element airwayElement) {
		// Création du document MongoDB.
		BasicDBObject document = new BasicDBObject();
		
		Integer airwayId = Integer.valueOf(airwayElement.getElementsByTagName("ID").item(0).getTextContent());
		
		// document.put("ID",			airwayId); // Supprimer, l'idenfiant ne nous sert à rien.
		document.put("Ident",		airwayElement.getElementsByTagName("Ident").item(0).getTextContent());

		ArrayList<BasicDBObject> way = new ArrayList<BasicDBObject>();
		int legsStartPosition = legsIndex.get(airwayId);
		Boolean test = true;
		
		while (test == true) {

			Node nNode1 = legsList.item(legsStartPosition);

			if (nNode1.getNodeType() == Node.ELEMENT_NODE) {

				Element eElement1 = (Element) nNode1;
				if ((eElement1.getElementsByTagName("AirwayID").item(0).getTextContent()).equals(airwayId)) {
					test = true;
					
					BasicDBObject document2 = new BasicDBObject();
					Integer waypointID = Integer.parseInt(eElement1.getElementsByTagName("Waypoint1ID").item(0).getTextContent());

					BasicDBObject document3 = new BasicDBObject();
					Element waypointElement = waypointsIndex.get(waypointID);
					
					document3.put("Latitude",waypointElement.getElementsByTagName("Latitude").item(0).getTextContent());
					document3.put("Longitude",waypointElement.getElementsByTagName("Longtitude").item(0).getTextContent());

					document2.put("Waypoint1ID", document3);

					way.add(document2);
				} else {
					test = false;

				}
			}
			legsStartPosition++;
		}

		document.put("Legs", way);
		return document;
	}
	
	/**
	 * Crée un index pour les waypoints (Identifiant, valeur).
	 * 
	 * @param waypointsList Liste des waypoints.
	 * @return HashMap retourne le waypoint à partir de son identifiant.
	 */
	private static HashMap<Integer, Element> indexWaypoints(NodeList waypointsList) {
		HashMap<Integer, Element> waypointsIndex = new HashMap<Integer, Element>();
		
		for (int i = 0; i < waypointsList.getLength(); ++i) {
			Node nNode = waypointsList.item(i);
			if (nNode.getNodeType() == Node.ELEMENT_NODE) {
				
				Element eElement = (Element) nNode;
				Integer waypointId = Integer.valueOf(eElement.getElementsByTagName("ID").item(0).getTextContent());
				
				if (!(waypointsIndex.containsKey(waypointId))) {
					waypointsIndex.put(waypointId, eElement);
				}
			}
		}
		
		return waypointsIndex;
	}

	/**
	 * Crée un index contenant la position du premier point de chaque airway.
	 * 
	 * @param legsList Liste des legs.
	 * @return HashMap indiquant la position du premier legs d'une airway à partir de l'identifiant de l'airway.
	 */
	private static HashMap<Integer, Integer> indexLegs(NodeList legsList) {
		HashMap<Integer, Integer> legsIndex = new HashMap<Integer, Integer>();
		
		for (int i = 0; i < legsList.getLength(); ++i) {
			Node nNode = legsList.item(i);
			if (nNode.getNodeType() == Node.ELEMENT_NODE) {
				
				Element eElement = (Element) nNode;
				Integer airwayId = Integer.valueOf(eElement.getElementsByTagName("AirwayID").item(0).getTextContent());
				
				if (!(legsIndex.containsKey(airwayId))) {
					legsIndex.put(airwayId, i);
				}
			}
		}
		
		return legsIndex;
	}

	/**
	 * Charge la liste des legs.
	 * 
	 * @param legsFilename Nom du fichiers.
	 * @return Liste des noeuds XML.
	 * @throws ParserConfigurationException
	 * @throws SAXException
	 * @throws IOException
	 */
	private static NodeList loadAirwayLegs(String legsFilename) throws ParserConfigurationException, SAXException, IOException {
		return loadNodes(legsFilename, "AirwayLegs");
	}

	/**
	 * Charge la liste des waypoints.
	 * 
	 * @param waypointsFilename
	 * @return
	 * @throws ParserConfigurationException
	 * @throws SAXException
	 * @throws IOException
	 */
	private static NodeList loadWaypoints(String waypointsFilename) throws ParserConfigurationException, SAXException, IOException {
		return loadNodes(waypointsFilename, "Waypoints");
	}

	/**
	 * Charge la liste des airways.
	 * 
	 * @param airwaysFilename
	 * @return
	 * @throws ParserConfigurationException
	 * @throws SAXException
	 * @throws IOException
	 */
	private static NodeList loadAirways(String airwaysFilename) throws ParserConfigurationException, SAXException, IOException {
		return loadNodes(airwaysFilename, "Airways");
	}

	/**
	 * Charge les noeuds d'un document.
	 * 
	 * @param filename Nom du fichier.
	 * @param tagName Nom du tag.
	 * @return Liste des noeuds sélectionnés.
	 * @throws SAXException
	 * @throws IOException
	 * @throws ParserConfigurationException
	 */
	private static NodeList loadNodes(String filename, String tagName) throws SAXException, IOException, ParserConfigurationException {
		// Factorisation du code pour les 3 méthodes ci-dessus.
		File f = new File(filename);
		Document d = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(f);
		d.getDocumentElement().normalize();
		return d.getElementsByTagName(tagName);
	}
}
