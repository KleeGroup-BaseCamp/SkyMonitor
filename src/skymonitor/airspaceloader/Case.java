package skymonitor.airspaceloader;

import java.lang.reflect.Array;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;

public abstract class Case {
	
	private String expr;
	
	public Case(String expr){
		this.expr = expr;
	}
	
	public boolean matches(String line){
		return line.startsWith(expr);
	}
	
	public abstract void execute(String line, BasicDBObject occ, DBCollection coll);	
	
	public static double interpolStep = 10; // degrees
	
	public static double[] convPt (String OAPtline){
		double[] result = new double[2];
		String OAPt = OAPtline.replaceAll("[ ,]","");
		String[] temp = OAPt.split("[SNWE]");
		int N, E;
		String NE = OAPt.replaceAll("[^a-zA-Z]", "");
		if (NE.substring(0, 1).matches("N")) {N = 1;} else {N = -1;}
		if (NE.substring(1, 2).matches("E")) {E = 1;} else {E = -1;}
		
		if (temp[0].matches(".*:.*:.*")) {
			String[] splitN = temp[0].split(":");
			String[] splitE = temp[1].split(":");
			result[1] = Integer.parseInt(splitN[0]) + Double.parseDouble(splitN[1])/60 + Double.parseDouble(splitN[2])/3600;
			result[0] = Integer.parseInt(splitE[0]) + Double.parseDouble(splitE[1])/60 + Double.parseDouble(splitE[2])/3600;
		}
		else if (temp[0].matches(".*:.*\\u002E.*")) {
			String[] splitN = temp[0].split(":");
			String[] splitE = temp[1].split(":");
			result[1] = Integer.parseInt(splitN[0]) + Double.parseDouble(splitN[1])/60;
			result[0] = Integer.parseInt(splitE[0]) + Double.parseDouble(splitE[1])/60;
		}
		else {
			result[1] = Double.parseDouble(temp[0]);
			result[0] = Double.parseDouble(temp[1]);
		}
		
		result[0] *= E; result[1] *= N;
		return result;
	}
	
	public static void closePolygon(BasicDBObject occ) {
		if (occ.containsField("FirstDP")) {
			double[] firstDP = (double[]) occ.get("FirstDP");
			addPointToPolygon(occ, firstDP);
			occ.removeField("FirstDP");
			occ.removeField("CurrentDP");
		}
	}
	
	public static void addPointToPolygon (BasicDBObject occ, double[] point) {
		double[] currentDP = (double[]) occ.get("CurrentDP");
		if (!(point[0] == currentDP[0] && point[1] == currentDP[1])) {
			Object DPo = occ.get("Polygon");
			String DPs = DPo.toString().replaceAll(" ","");
			DPs = DPs.substring(0,DPs.length()-3) + ",[" + Double.toString(point[0]) + "," + Double.toString(point[1]) + "]]]}";
			DBObject NewDPo = (DBObject)JSON.parse(DPs);
			occ.put("Polygon", NewDPo);
			occ.put("CurrentDP", point);
		}
	}
	
	public static void createPolygonWithPoint (BasicDBObject occ, double[] point) {
		String DPs;
		DPs = "{type: 'Polygon', coordinates: [[ ["
	+ Double.toString(point[0])+ ","+ Double.toString(point[1]) +"] ]]}";
		occ.put("FirstDP", point);
		DBObject DPo = (DBObject)JSON.parse(DPs);
		occ.put("Polygon", DPo);
		occ.put("CurrentDP", point);
	}
	
	public static double[] createPointOnCircle(Object Vpoint, double radius, double angle) {
		double[] point = new double[2];
		point[1] = Array.getDouble(Vpoint,1) + Math.toDegrees(radius)*Math.cos(Math.toRadians(angle));
		point[0] = Array.getDouble(Vpoint,0) + Math.toDegrees(radius)*Math.sin(Math.toRadians(angle))/Math.cos(Math.toRadians(point[1]));
		return point;
	}
}
