package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;

public class DPCase extends Case {
	public DPCase(){
		super ("DP");
	}
	
	@Override
	public void execute(String line, BasicDBObject occ, DBCollection coll) {
		String chaine = line.substring(3).replaceAll(" |\\u002A.*","");
		double[] point = convPt(chaine);
		String DPs;
		if (occ.containsField("Polygon")) {
			Object DPo = occ.get("Polygon");
			DPs = DPo.toString().replaceAll(" ","");
			DPs = DPs.substring(0,DPs.length()-3) + ",[" + Double.toString(point[0]) + "," + Double.toString(point[1]) + "]]]}";
		}
		else {
			DPs = "{type: 'Polygon', coordinates: [[ ["
		+ Double.toString(point[0])+ ","+ Double.toString(point[1]) +"] ]]}";
			occ.put("FirstDP", point);
		}
		DBObject DPo = (DBObject)JSON.parse(DPs);
		occ.put("Polygon", DPo);
	}
	
	public static void closePolygon(double[] point, BasicDBObject occ) {
		Object DPo = occ.get("Polygon");
		String DPs = DPo.toString().replaceAll(" ","");
		DPs = DPs.substring(0,DPs.length()-3) + ",[" + Double.toString(point[0]) + "," + Double.toString(point[1]) + "]]]}";
		DBObject newDPo = (DBObject)JSON.parse(DPs);
		occ.put("Polygon", newDPo);
	}
}
