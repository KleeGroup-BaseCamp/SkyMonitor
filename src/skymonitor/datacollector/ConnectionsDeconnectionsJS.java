package skymonitor.datacollector;

import java.io.InputStream;
import java.net.*;

public class ConnectionsDeconnectionsJS {
	
	//Fonction de deconnection au JS
	public static void connectionJS() {
		try {
			URL sourceDonnees = new URL("http://db.flightradar24.com/zones/full_all.js"); // Définition de la source de données
			URLConnection connexion = sourceDonnees.openConnection(); // Ouverture de la connection
			InputStream flux = connexion.getInputStream(); // Définition du flux de données
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	// Fonction de connection au JS
	public static void deconnectionJS() {
//		flux.close();
	}
}
