package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;

public class VPointCase extends Case {
	public VPointCase(){
		super ("V X");
	}
	
	@Override
	public void execute(String line, BasicDBObject occ, DBCollection coll){
		String chaine = line.substring(4).replaceAll(" |\\u002A.*","");
		double[] point = convPt(chaine);
		occ.put("Vpoint", point);
	}
}
