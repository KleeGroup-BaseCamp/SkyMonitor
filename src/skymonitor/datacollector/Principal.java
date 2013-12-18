package skymonitor.datacollector;

import java.io.InputStream;
import com.mongodb.*;

public class Principal {
	
	static InputStream flux = null;
	
	static BasicDBObject dots = new BasicDBObject();
	
	static String server = "localhost";
	static String database = "db";
	static String collection = "points";
	static Database databaseInstance = new Database(server, database, collection);
	
	public static void main() {
		Repeteur.main(); //Répète Executeur toutes les x secondes
	}
}
