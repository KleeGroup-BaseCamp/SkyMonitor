package skymonitor.datacollector;

import java.io.InputStream;
import java.net.*;

public class ConnectJS {

	public static void connectionJS() {
		try {
			URL sourceDonnees = new URL("http://db.flightradar24.com/zones/full_all.js");
			URLConnection connexion = sourceDonnees.openConnection();
			Principal.flux = connexion.getInputStream();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
