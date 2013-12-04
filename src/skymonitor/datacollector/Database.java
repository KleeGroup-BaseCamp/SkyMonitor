package skymonitor.datacollector;

import com.mongodb.DB;
import com.mongodb.Mongo;

public class Database {
	public Database(String server, String database) {
		try {
			this.mongo = new Mongo(server, 27017);
			this.db = mongo.getDB(database);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	public Mongo mongo;
	public DB db;
}
