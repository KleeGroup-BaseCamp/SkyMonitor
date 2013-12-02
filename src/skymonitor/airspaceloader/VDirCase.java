package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;

public class VDirCase extends Case {
	public VDirCase(){
		super ("V D");
	}
	
	@Override
	public void execute(String line, BasicDBObject occ, DBCollection coll) {
		String chaine = line.substring(4, 5);
		if (chaine.matches("-")) {
			occ.put("Vdir", -1);
		}
		else if (chaine.matches("\\u002B")) {
			occ.put("Vdir", 1);
		}
	}
}
