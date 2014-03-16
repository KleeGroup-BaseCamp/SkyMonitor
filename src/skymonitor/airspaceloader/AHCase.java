package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;

public class AHCase extends Case {
	public AHCase() {
		super ("AH");
	}
	
	@Override
	public void execute(String line, BasicDBObject occ, DBCollection coll) {
		String chaine = line.substring(3).replaceAll("\\u002A.*", "");
		double val = Double.POSITIVE_INFINITY;
		if (chaine.matches(".*FL.*")) {
			if (chaine.matches(".*AGL.*")) {
				val = Double.parseDouble(chaine.replaceAll("[^0-9]", ""))*-100;
			}
			else {
				val = Double.parseDouble(chaine.replaceAll("[^0-9]", ""))*100;
			}
		}
		else if (chaine.matches(".*(FT|ALT).*")){
			if (chaine.matches(".*AGL.*")) {
				val = Double.parseDouble(chaine.replaceAll("[^0-9]", ""))*-1;
			}
			else {
				val = Double.parseDouble(chaine.replaceAll("[^0-9]", ""));
			}
		}
		occ.put("Ceiling", val);
	}
}
