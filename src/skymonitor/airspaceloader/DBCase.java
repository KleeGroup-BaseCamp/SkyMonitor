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
		
		Object Vpoint = occ.get("Vpoint");
		
		insertRealArc(Vpoint, pointStart, pointStop, occ, coll);
	}
	
	public static double calculateStartAngle (Object Vpoint, double radius, double[] pointStart) {
		double anStart;
		if (pointStart[0]-Array.getDouble(Vpoint, 0) >= 0) {
			anStart = Math.toDegrees(Math.acos((pointStart[1]-Array.getDouble(Vpoint, 1))/radius));
		}
		else {
			anStart = 360-Math.toDegrees(Math.acos((pointStart[1]-Array.getDouble(Vpoint, 1))/radius));
		}
		return anStart;
	}
	
	public static double calculateStopAngle (Object Vpoint, double radius, double[] pointStop) {
		double anStop;
		if (pointStop[0]-Array.getDouble(Vpoint, 0) >= 0) {
			anStop = Math.toDegrees(Math.acos((pointStop[1]-Array.getDouble(Vpoint, 1))/radius));
		}
		else {
			anStop = 360-Math.toDegrees(Math.acos((pointStop[1]-Array.getDouble(Vpoint, 1))/radius));
		}
		return anStop;
	}
	
	public static double calculateRadius (Object Vpoint, double[] pointStart) { // degrees on earth surface
		double radius = Math.sqrt(Math.pow((Array.getDouble(Vpoint,0) - pointStart[0])*Math.cos(Math.toRadians(Array.getDouble(Vpoint,1))),2)
				+ Math.pow(Array.getDouble(Vpoint,1) - pointStart[1],2));
		return radius;
	}
	
	public static void insertAsPolygon (Object Vpoint, double[] pointStart, double[] pointStop, BasicDBObject occ, DBCollection coll) {
		if (occ.containsField("Polygon")) {
			addPointToPolygon(occ, pointStart);
			double radius = calculateRadius(Vpoint, pointStart);
			double anStart = calculateStartAngle(Vpoint, radius, pointStart);
			double anStop = calculateStopAngle(Vpoint, radius, pointStop);
			try {
				if (occ.getInt("Vdir") == -1) {
					while (anStart > anStop) { // prendre en compte s'ils sont à cheval du 0
						// créer le nouveau point en fct d'un pas d'angle à soustraire à anStart
					}
					addPointToPolygon(occ, pointStop);
				}
				else {
					throw new NullPointerException();
				}
			}
			catch (NullPointerException e) {
				while (anStart < anStop) {
					
				}
				addPointToPolygon(occ, pointStop);
			}
		}
		else {
			createPolygonWithPoint(occ, pointStart);
			insertAsPolygon(Vpoint, pointStart, pointStop, occ, coll);
		}
	}
	
	public static void insertRealArc (Object Vpoint, double[] pointStart, double[] pointStop, BasicDBObject occ, DBCollection coll) {
		try {
			int Vdir = occ.getInt("Vdir");
			if (Vdir == -1) {
				double[] tampon = pointStart;
				pointStart = pointStop;
				pointStop = tampon;
			}
		}
		catch (NullPointerException e) {}
		
		BasicDBObject centre = new BasicDBObject();
		centre.put("type", "Point");
		centre.put("coordinates", Vpoint);
		BasicDBObject arc = new BasicDBObject();
		arc.put("center", centre);
		
		double radius = calculateRadius(Vpoint, pointStart); // degrees on earth sphere
		arc.put("radius", Math.toRadians(radius)*6371/1.852); // nautical miles
		
		double anStart = calculateStartAngle(Vpoint, radius, pointStart);
		double anStop = calculateStopAngle(Vpoint, radius, pointStop);
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
