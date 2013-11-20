package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;

public class DACase extends Case {
	public DACase(){
		super ("DA");
	}
	
	@Override
	public void execute(String line, BasicDBObject occ, DBCollection coll) {
		String chaine = line.substring(3).replaceAll(" |\\u002A.*","");
		String[] temp = chaine.split(",");
					
		Object Vpoint = occ.get("Vpoint");
		BasicDBObject centre = new BasicDBObject();
		centre.put("type", "Point");
		centre.put("coordinates", Vpoint);
		
		BasicDBObject arc = new BasicDBObject();
		arc.put("center", centre);
		arc.put("radius", Double.parseDouble(temp[0]));
		try {
			int Vdir = occ.getInt("Vdir");
			if (Vdir == 1) {
				arc.put("start", Double.parseDouble("temp[0]"));
				arc.put("stop", Double.parseDouble("temp[1]"));
			}
			else {
				arc.put("start", Double.parseDouble("temp[1]"));
				arc.put("stop", Double.parseDouble("temp[0]"));
			}
		}
		catch (NullPointerException e) {
			arc.put("start", Double.parseDouble("temp[0]"));
			arc.put("stop", Double.parseDouble("temp[1]"));
		}
		
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
