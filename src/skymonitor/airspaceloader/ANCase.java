package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;

public class ANCase extends Case {
	public ANCase(){
		super ("AN");
	}
	
	public void execute(String line, BasicDBObject occ, DBCollection coll) {
		String chaine = line.substring(3).replaceAll("\\u002A.*", "");
		occ.put("Nom", chaine);
	}
}
