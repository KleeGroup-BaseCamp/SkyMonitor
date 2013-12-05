package skymonitor.datacollector;

import java.io.InputStream;
import java.util.Map;

import com.mongodb.*;

public class Principal {
	
	static InputStream flux = null;
	
	static BasicDBObject dots = new BasicDBObject();
	
	static void main() {
		
		String server = "localhost";
		String database = "db";
		Database databaseInstance = new Database(server, database);
		
		ConnectJS.connectionJS(); //Connection JS
		
		Repeteur.main();//Repeter le code contenu dans Executeur toutes les x secondes
	}
}
