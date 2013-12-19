package skymonitor.datacollector;

import com.mongodb.*;
import com.mongodb.util.JSON;

import java.io.*;
import java.util.Collection;
import java.util.GregorianCalendar;
import java.util.Iterator;

public class Executeur {
	
	String dateElementToString(int Element) {
		String result = Integer.toString(Element);
		if (result.length()<2) {
			result = "0"+result;
		}
		return result;
	}
	
	String dateToString(long time) { //time in seconds
		GregorianCalendar date = new GregorianCalendar();
		date.setTimeInMillis(time*1000);
		
		String result = dateElementToString(date.get(date.YEAR))
				+ dateElementToString(date.get(date.MONTH)+1) //January == 0
				+ dateElementToString(date.get(date.DATE))
				+ dateElementToString(date.get(date.HOUR_OF_DAY))
				+ dateElementToString(date.get(date.MINUTE))
				+ dateElementToString(date.get(date.SECOND));
		return result;
	}
	
	public void main() {
		InputStreamReader isr = new InputStreamReader(Principal.flux);
		BufferedReader br = new BufferedReader(isr);
		try {
			String fluxString = br.readLine().replace("pd_callback(","").replace(");","");
			DBObject dotsObj = (DBObject)JSON.parse(fluxString);
			dotsObj.removeField("full_count");
			dotsObj.removeField("version");
			Collection<BasicDBList> dots = dotsObj.toMap().values();
			Iterator<BasicDBList> dotsIterator = dots.iterator();
			
			while (dotsIterator.hasNext()) {
				Object[] dot = dotsIterator.next().toArray();

				Principal.dots.put("Hex", (String)dot[0]);
				Principal.dots.put("Lat", (double)dot[1]);
				Principal.dots.put("Lon", (double)dot[2]);
				
				BasicDBObject point = new BasicDBObject();
				double[] coords = {(double)dot[2],(double)dot[1]};
				point.put("type", "Point");
				point.put("coordinates", coords);
				Principal.dots.put("Point",point);
				
				Principal.dots.put("Hdg", (int)dot[3]);
				Principal.dots.put("Alt", (int)dot[4]*100); // En pieds
				Principal.dots.put("Spd", (int)dot[5]);
				Principal.dots.put("Sqk", (String)dot[6]);
				Principal.dots.put("Rdr", (String)dot[7]);
				Principal.dots.put("Typ", (String)dot[8]);
				Principal.dots.put("Immat", (String)dot[9]);
				Principal.dots.put("Time", (int)dot[10]); // In seconds since 1970-1-1 00:00:00.000 GMT
				Principal.dots.put("From", (String)dot[11]);
				Principal.dots.put("To", (String)dot[12]);
				Principal.dots.put("Flight", (String)dot[13]);
				Principal.dots.put("Vspeed", (int)dot[15]); // En pieds par minute
				Principal.dots.put("Callsign", (String)dot[16]);
				Principal.dots.put("DotID", dateToString((int)dot[10]) + (String)dot[16]);
				Principal.dots.put("Eta", (int)dot[17]);
				
				Principal.databaseInstance.DBCollection.insert(Principal.dots);
				Principal.dots.clear();
			} 
			br.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
