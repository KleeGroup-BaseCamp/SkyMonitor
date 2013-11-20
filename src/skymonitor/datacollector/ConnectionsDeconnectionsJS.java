package skymonitor.datacollector;

import java.io.InputStream;
import java.net.*;

public class ConnectionsDeconnectionsJS {
	
	//Fonction de deconnection au JS
	public static void connectionJS() {
		try {
			URL sourceDonnees = new URL("http://db.flightradar24.com/zones/full_all.js"); // D�finition de la source de donn�es
			URLConnection connexion = sourceDonnees.openConnection(); // Ouverture de la connection
			InputStream flux = connexion.getInputStream(); // D�finition du flux de donn�es
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	// Fonction de connection au JS
	public static void deconnectionJS() {
//		flux.close();
	}
}
