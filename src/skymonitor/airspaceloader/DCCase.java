package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;

public class DCCase extends Case {
	public DCCase(){
		super ("DC");
	}
	
	@Override
	public void execute(String line, BasicDBObject occ, DBCollection coll) {
		String chaine = line.substring(3).replaceAll(" |\\u002A.*","");
		
		Object Vpoint = occ.get("Vpoint");
		BasicDBObject centre = new BasicDBObject();
		centre.put("type", "Point");
		centre.put("coordinates", Vpoint);
		BasicDBObject arc = new BasicDBObject();
		arc.put("center", centre);
		
		double radius = Double.parseDouble(chaine);
		arc.put("radius", radius);
		
		DBObject Arcs;
		if (occ.containsField("Arcs")) {
			String arcs = occ.get("Arcs").toString().replaceAll(" ","");
			arcs = arcs.substring(0, arcs.length()-1) +","+ arc.toString() + "]";
			Arcs = (DBObject)JSON.parse(arcs);
		}
		else {
			Arcs = (DBObject)JSON.parse("["+arc.toString()+"]");
		}
		occ.put("Arcs", Arcs);
	}
}
