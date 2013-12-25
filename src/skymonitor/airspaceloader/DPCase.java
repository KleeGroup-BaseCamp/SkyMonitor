package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;

public class DPCase extends Case {
	public DPCase(){
		super ("DP");
	}
	
	@Override
	public void execute(String line, BasicDBObject occ, DBCollection coll) {
		String chaine = line.substring(3).replaceAll(" |\\u002A.*","");
		double[] point = convPt(chaine);
		if (occ.containsField("Polygon")) {
			addPointToPolygon(occ, point);
		}
		else {
			createPolygonWithPoint(occ, point);
		}
	}
}
