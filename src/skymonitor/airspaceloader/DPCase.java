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
		occ.put("CurrentDP", point);
	}
	
	public static void closePolygon(BasicDBObject occ) {
		if (occ.containsField("FirstDP")) {
			double[] firstDP = (double[]) occ.get("FirstDP");
			double[] currentDP = (double[]) occ.get("CurrentDP");
			if (!(firstDP[0] == currentDP[0] && firstDP[1] == currentDP[1])) {
				Object DPo = occ.get("Polygon");
				String DPs = DPo.toString().replaceAll(" ","");
				DPs = DPs.substring(0,DPs.length()-3) + ",[" + Double.toString(firstDP[0]) + "," + Double.toString(firstDP[1]) + "]]]}";
				DBObject newDPo = (DBObject)JSON.parse(DPs);
				occ.put("Polygon", newDPo);
			}
			occ.removeField("FirstDP");
			occ.removeField("CurrentDP");
		}
	}
}
