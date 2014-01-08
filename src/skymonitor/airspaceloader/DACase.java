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
		double radius = Double.parseDouble(temp[0]); // nm
		double startAngle = Double.parseDouble(temp[1]);
		double stopAngle = Double.parseDouble(temp[2]);
		
		Object Vpoint = occ.get("Vpoint");
		
		insertAsPolygon(Vpoint, radius*1.852/6371, startAngle, stopAngle, occ, coll); // distanceRadius/earthRadius
		insertRealArc(Vpoint, radius, startAngle, stopAngle, occ, coll);
	}
	
	public static void insertAsPolygon (Object Vpoint, double radius, double anStart, double anStop, BasicDBObject occ, DBCollection coll) {
		double[] pointStart = createPointOnCircle(Vpoint, radius, anStart);
		double[] pointStop = createPointOnCircle(Vpoint, radius, anStop);
		if (occ.containsField("Polygon")) {
			addPointToPolygon(occ, pointStart);
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
			insertAsPolygon(Vpoint, radius, anStart, anStop, occ, coll);
		}
	}
	
	public static void insertRealArc (Object Vpoint, double radius, double startAngle, double stopAngle, BasicDBObject occ, DBCollection coll) {
		BasicDBObject centre = new BasicDBObject();
		centre.put("type", "Point");
		centre.put("coordinates", Vpoint);
		
		BasicDBObject arc = new BasicDBObject();
		arc.put("center", centre);
		arc.put("radius", radius);
		try {
			int Vdir = occ.getInt("Vdir");
			if (Vdir == -1) {
				arc.put("start", stopAngle);
				arc.put("stop", startAngle);
			}
			else {
				throw new NullPointerException();
			}
		}
		catch (NullPointerException e) {
			arc.put("start", startAngle);
			arc.put("stop", stopAngle);
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
