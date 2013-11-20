package skymonitor.airspaceloader;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;

public abstract class Case {
	
	private String expr;
	
	public Case(String expr){
		this.expr = expr;
	}
	
	public boolean matches(String line){
		return line.startsWith(expr);
	}
	public abstract void execute(String line, BasicDBObject occ, DBCollection coll);	
	
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
}
