package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;

public class ACCase extends Case {
	public ACCase(){
		super ("AC");
	}
	
	@Override
	public void execute(String line, BasicDBObject occ, DBCollection coll) {
		Object Vpoint = occ.get("Vpoint");
		Object Vdir = occ.get("Vdir");
		occ.removeField("Vpoint");
		occ.removeField("Vdir");
		occ.put("Pays", LectureFichier.pays);
		coll.insert(occ);
		occ.clear();
		occ.put("Vpoint", Vpoint);
		occ.put("Vdir", Vdir);
		String chaine = line.substring(3).replaceAll("\\u002A.*", "");
		occ.put("Type", chaine);
	}
}
