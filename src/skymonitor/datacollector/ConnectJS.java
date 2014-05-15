package skymonitor.datacollector;
//newline
import java.net.*;

public class ConnectJS {

	public static void connectionJS() {
		try {
			Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("172.20.0.9", 3128));
			URL sourceDonnees = new URL("http://db.flightradar24.com/zones/full_all.js");
			URLConnection connexion = sourceDonnees.openConnection(proxy);
			Principal.flux = connexion.getInputStream();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
