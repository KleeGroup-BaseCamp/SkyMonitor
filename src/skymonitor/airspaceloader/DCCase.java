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
		double radius = Double.parseDouble(chaine); // nm
		
		insertCircle(Vpoint, radius*1.852/6371, occ, coll);
		DACase.insertRealArc(Vpoint, radius, 0, 360, occ, coll);
	}
	
	public static void insertCircle(Object Vpoint, double radius, BasicDBObject occ, DBCollection coll) {
		Object[] circle = {Vpoint, radius};
		occ.put("Geometry", circle);
	}
}
