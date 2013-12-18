package skymonitor.datacollector;

import com.mongodb.*;

public class Database {
	public Database(String server, String database, String collection) {
		try {
			this.mongo = new Mongo(server, 27017);
			this.db = mongo.getDB(database);
			this.DBCollection = db.getCollection(collection);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	public Mongo mongo;
	public DB db;
	public DBCollection DBCollection;
}
