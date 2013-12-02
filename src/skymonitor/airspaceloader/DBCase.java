package skymonitor.airspaceloader;

import java.lang.reflect.Array;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;

public class DBCase extends Case {
	public DBCase(){
		super ("DB");
	}
	
	@Override
	public void execute(String line, BasicDBObject occ, DBCollection coll) {
		String chaine = line.substring(3).replaceAll(" |\\u002A.*","");
		String[] split = chaine.split(",");
		double[] pointStart = convPt(split[0]);
		double[] pointStop = convPt(split[1]);
		try {
			int Vdir = occ.getInt("Vdir");
			if (Vdir == -1) {
				double[] tampon = pointStart;
				pointStart = pointStop;
				pointStop = tampon;
			}
		}
		catch (NullPointerException e) {}
		
		Object Vpoint = occ.get("Vpoint");
		BasicDBObject centre = new BasicDBObject();
		centre.put("type", "Point");
		centre.put("coordinates", Vpoint);
		BasicDBObject arc = new BasicDBObject();
		arc.put("center", centre);
		
		double radius = Math.sqrt(Math.pow((Array.getDouble(Vpoint,0) - pointStart[0])*Math.cos(Math.toRadians(Array.getDouble(Vpoint,1))),2)
				+ Math.pow(Array.getDouble(Vpoint,1) - pointStart[1],2));
		arc.put("radius", Math.toRadians(radius)*6371/1.852);
		
		double anStart;
		double anStop;
		if (pointStart[0]-Array.getDouble(Vpoint, 0) >= 0) {
			anStart = Math.toDegrees(Math.acos((pointStart[1]-Array.getDouble(Vpoint, 1))/radius));
		}
		else {
			anStart = 360-Math.toDegrees(Math.acos((pointStart[1]-Array.getDouble(Vpoint, 1))/radius));
		}
		if (pointStop[0]-Array.getDouble(Vpoint, 0) >= 0) {
			anStop = Math.toDegrees(Math.acos((pointStop[1]-Array.getDouble(Vpoint, 1))/radius));
		}
		else {
			anStop = 360-Math.toDegrees(Math.acos((pointStop[1]-Array.getDouble(Vpoint, 1))/radius));
		}
		arc.put("start", anStart);
		arc.put("stop", anStop);
		
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
