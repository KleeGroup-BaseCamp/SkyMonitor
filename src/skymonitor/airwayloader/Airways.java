package skymonitor.airwayloader;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
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
import com.mongodb.util.JSON;
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
	
	public static String processRequest(HttpServletRequest request) {
		if ("POST".equals(request.getMethod())) {
			FileItemFactory factory = new DiskFileItemFactory();
			ServletFileUpload upload = new ServletFileUpload(factory);
			upload.setSizeMax(100000000);// 100 Mo
			
			try {
				List<FileItem> files = upload.parseRequest(request);
				InputStream legsIps = null;
				InputStream airwaysIps = null;
				InputStream waypointsIps = null;
				
				String mongoServer = request.getServletContext().getInitParameter("mongoserver");
				String mongoDatabase = request.getServletContext().getInitParameter("mongodatabase");
				
				int i = 0; 
				for (FileItem file : files) {
					if (i == 0) {
						legsIps = file.getInputStream();
						i++;
					}
					else if (i == 1) {
						airwaysIps = file.getInputStream();
						i++;
					}
					else if (i == 2) {
						waypointsIps = file.getInputStream();
						i++;
					}
				}
				
				documentsReader(legsIps, airwaysIps, waypointsIps, mongoServer, mongoDatabase);
				return "Route charg&eacute;e.";
			} catch (Exception e) {
				e.printStackTrace();
			}
			
			return "Failed to upload files!";
			
		}
		return "Chargement des fichiers airways : (" + request.getServletContext().getInitParameter("mongodatabase") +")";
	}

	public static void documentsReader(InputStream legsIps, InputStream airwaysIps, InputStream waypointsIps, String mongoServer, String mongoDatabase) {
		String mongoCollection = "airWays";

		try {
			Mongo mongo = new Mongo(mongoServer, 27017);
			DB db = mongo.getDB(mongoDatabase);

			DBCollection collection = db.getCollection(mongoCollection);

			// Load input files.
			legsList = loadAirwayLegs(legsIps);
			NodeList airwaysList = loadAirways(airwaysIps);
			NodeList waypointsList = loadWaypoints(waypointsIps);

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
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	public static void main(String[] args) {
		
		String legsFilename = "../AirwayLegs.xml";
		String airwaysFilename = "../Airways.xml";
		String waypointsFilename = "../Waypoints.xml";
		
		String mongoServer = "localhost";
		String mongoDatabase = "db";
		
		try {
			InputStream legsIps = new FileInputStream(legsFilename);
			InputStream airwaysIps = new FileInputStream(airwaysFilename);
			InputStream waypointsIps = new FileInputStream(waypointsFilename);
			documentsReader(legsIps, airwaysIps, waypointsIps, mongoServer, mongoDatabase);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static BasicDBObject createAirwayDocument(Element airwayElement) {
		// Création du document MongoDB.
		BasicDBObject document = new BasicDBObject();
		
		Integer airwayId = Integer.valueOf(airwayElement.getElementsByTagName("ID").item(0).getTextContent());
		
		// document.put("ID",airwayId); // Supprimer, l'idenfiant ne nous sert à rien.
		document.put("Ident",airwayElement.getElementsByTagName("Ident").item(0).getTextContent());

		ArrayList<BasicDBObject> way = new ArrayList<BasicDBObject>();
		ArrayList<ArrayList> points = new ArrayList<ArrayList>();
		int legsStartPosition = legsIndex.get(airwayId);
		Boolean test = true;
		
		while (test == true) {

			Node nNode1 = legsList.item(legsStartPosition);

			if (nNode1.getNodeType() == Node.ELEMENT_NODE) {

				Element eElement1 = (Element) nNode1;
				if ((eElement1.getElementsByTagName("AirwayID").item(0).getTextContent()).equals(airwayElement.getElementsByTagName("ID").item(0).getTextContent())) {
					test = true;
					
					BasicDBObject document2 = new BasicDBObject();
					Integer waypoint1ID = Integer.parseInt(eElement1.getElementsByTagName("Waypoint1ID").item(0).getTextContent());
					Integer waypoint2ID = Integer.parseInt(eElement1.getElementsByTagName("Waypoint2ID").item(0).getTextContent());
					
					Element waypointElement3 = waypointsIndex.get(waypoint1ID);
					Element waypointElement4 = waypointsIndex.get(waypoint2ID);
	
	                ArrayList<ArrayList> coordonnees = new ArrayList<ArrayList>();
	                ArrayList<String> latlong1 = new ArrayList<String>();
	                ArrayList<String> latlong2 = new ArrayList<String>();
	                latlong1.add(waypointElement3.getElementsByTagName("Longtitude").item(0).getTextContent());
	                latlong1.add(waypointElement3.getElementsByTagName("Latitude").item(0).getTextContent());
	                latlong2.add(waypointElement4.getElementsByTagName("Longtitude").item(0).getTextContent());
	                latlong2.add(waypointElement4.getElementsByTagName("Latitude").item(0).getTextContent());
	                
	                coordonnees.add(latlong1);
	                coordonnees.add(latlong2);
	                
	                ArrayList<ArrayList> coordonneesaux = new ArrayList<ArrayList>();
	                coordonneesaux.add(latlong2);
	                coordonneesaux.add(latlong1);
	                BasicDBObject documentaux = new BasicDBObject();
					BasicDBObject lineaux = new BasicDBObject();
	                documentaux.put("From",waypointElement4.getElementsByTagName("Ident").item(0).getTextContent());
	                documentaux.put("To",waypointElement3.getElementsByTagName("Ident").item(0).getTextContent());
	                documentaux.put("direction",1);
	                lineaux.put("type","LineString");
                    lineaux.put("coordinates",coordonneesaux);
                    documentaux.put("Line", lineaux);
	                
	                Boolean test1 = true;   
	                
	                int j = 0;
	                while (j < way.size() && test1) {
	                	if (way.get(j).equals(documentaux)) {
	                		way.remove(way.get(j));
	                		test1 = false;
	                	}
	                	j++;
	                }
					
		            BasicDBObject line = new BasicDBObject();
					if (test1 ==true) {
					document2.put("From", waypointElement3.getElementsByTagName("Ident").item(0).getTextContent());
                    document2.put("To", waypointElement4.getElementsByTagName("Ident").item(0).getTextContent());
                    document2.put("direction", 1);
                    line.put("type","LineString");
                    line.put("coordinates",coordonnees);
                    document2.put("Line", line);
                    
                    }
					
					else {
						document2.put("From", waypointElement3.getElementsByTagName("Ident").item(0).getTextContent());
	                    document2.put("To", waypointElement4.getElementsByTagName("Ident").item(0).getTextContent());
	                    document2.put("direction", 0);
	                    line.put("type","LineString");
	                    line.put("coordinates",coordonnees);
	                    document2.put("Line", line);
	                    };
	                    
                       
					if (!(points.contains(latlong1)))  {
					points.add(latlong1);
					}
					else if (!(points.contains(latlong2)))  {
						points.add(latlong2);
						
					};
					
					way.add(document2);
					
				} else {
					test = false;

				}
			}
			legsStartPosition++;
		}
		BasicDBObject route = new BasicDBObject();
		route.put("type","LineString");
		route.put("coordinates", points);
		document.put("Legs", way);
		document.put("Geometry", route);
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
	private static NodeList loadAirwayLegs(InputStream ips) throws ParserConfigurationException, SAXException, IOException {
		return loadNodes(ips, "AirwayLegs");
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
	private static NodeList loadWaypoints(InputStream ips) throws ParserConfigurationException, SAXException, IOException {
		return loadNodes(ips, "Waypoints");
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
	private static NodeList loadAirways(InputStream ips) throws ParserConfigurationException, SAXException, IOException {
		return loadNodes(ips, "Airways");
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
	private static NodeList loadNodes(InputStream fileIps, String tagName) throws SAXException, IOException, ParserConfigurationException {
		// Factorisation du code pour les 3 méthodes ci-dessus.
		Document d = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(fileIps);
		d.getDocumentElement().normalize();
		return d.getElementsByTagName(tagName);
	}
}
