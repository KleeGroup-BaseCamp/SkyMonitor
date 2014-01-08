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
		
		insertAsPolygon(Vpoint, pointStart, pointStop, occ, coll);
		insertRealArc(Vpoint, pointStart, pointStop, occ, coll);
	}
	
	public static double calculateAngle (Object Vpoint, double radius, double[] point) {
		double angle;
		if (point[0]-Array.getDouble(Vpoint, 0) >= 0) {
			angle = Math.toDegrees(Math.acos((point[1]-Array.getDouble(Vpoint, 1))/Math.toDegrees(radius)));
		}
		else {
			angle = 360-Math.toDegrees(Math.acos((point[1]-Array.getDouble(Vpoint, 1))/Math.toDegrees(radius)));
		}
		return angle;
	}
	
	public static double calculateRadius (Object Vpoint, double[] pointStart) { // distanceRadius/earthRadius
		double radius = Math.toRadians(Math.sqrt(Math.pow((Array.getDouble(Vpoint,0) - pointStart[0])
							*Math.cos(Math.toRadians(pointStart[1])),2)
						+ Math.pow(Array.getDouble(Vpoint,1) - pointStart[1],2)));
		return radius;
	}
	
	public static void insertAsPolygon (Object Vpoint, double[] pointStart, double[] pointStop, BasicDBObject occ, DBCollection coll) {
		if (occ.containsField("Geometry")) {
			addPointToPolygon(occ, pointStart);
			double radius = calculateRadius(Vpoint, pointStart);
			double anStart = calculateAngle(Vpoint, radius, pointStart);
			double anStop = calculateAngle(Vpoint, radius, pointStop);
			try {
				if (occ.getInt("Vdir") == -1) {
					if (anStop > anStart) {
						anStop -= 360;
					}
					anStart -= interpolStep;
					while (anStart > anStop + interpolStep/10) { //createPointOnPolygon and calculateAngle are not perfectly reciprocal
						double[] newPoint = createPointOnCircle(Vpoint, radius, anStart);
						addPointToPolygon(occ, newPoint);
						anStart -= interpolStep;
					}
					addPointToPolygon(occ, pointStop);
				}
				else {
					throw new NullPointerException();
				}
			}
			catch (NullPointerException e) {
				if (anStop < anStart) {
					anStop += 360;
				}
				anStart += interpolStep;
				while (anStart < anStop-interpolStep/10) {
					double[] newPoint = createPointOnCircle(Vpoint, radius, anStart);
					addPointToPolygon(occ, newPoint);
					anStart += interpolStep;
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
		
		double radius = calculateRadius(Vpoint, pointStart); // distanceRadius/earthRadius
		arc.put("radius", radius*6371/1.852); // nautical miles
		
		double anStart = calculateAngle(Vpoint, radius, pointStart);
		double anStop = calculateAngle(Vpoint, radius, pointStop);
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
