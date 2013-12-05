package skymonitor.datacollector;

import com.mongodb.*;
import com.mongodb.util.JSON;

import java.sql.Date;
import java.util.Collection;
import java.util.GregorianCalendar;
import java.util.Iterator;
import java.util.NoSuchElementException;

public class Executeur {
	
	String dateToString(long time) {
		GregorianCalendar date = new GregorianCalendar();
		date.setTimeInMillis(time*1000);
		
		String result = Integer.toString(date.YEAR)
				+ Integer.toString(date.MONTH)
				+ Integer.toString(date.DATE)
				+ Integer.toString(date.HOUR)
				+ Integer.toString(date.MINUTE)
				+ Integer.toString(date.SECOND);
		return result;
	}
	
	void main() {
		String fluxString = Principal.flux.toString().replace("pd_callback(","").replace(");","");
		DBObject dotsObj = (DBObject)JSON.parse(fluxString);
		Collection<Object[]> dots = dotsObj.toMap().values();
		Iterator<Object[]> dotsIterator = dots.iterator();
		
		while (dotsIterator.hasNext()) {
			try {
				Object[] dot = dotsIterator.next();
				
				Principal.dots.put("Hex", (String)dot[0]);
				Principal.dots.put("Lat", (double)dot[1]);
				Principal.dots.put("Lon", (double)dot[2]);
				Principal.dots.put("Hdg", (int)dot[3]);
				Principal.dots.put("Alt", (int)dot[4]*100);
				Principal.dots.put("Spd", (int)dot[5]);
				Principal.dots.put("Sqk", (String)dot[6]);
				Principal.dots.put("Rdr", (String)dot[7]);
				Principal.dots.put("Typ", (String)dot[8]);
				Principal.dots.put("Immat", (String)dot[9]);
				Principal.dots.put("Time", (long)dot[10]); // In ms since 1970-1-1 00:00:00.000 GMT
				Principal.dots.put("From", (String)dot[11]);
				Principal.dots.put("To", (String)dot[12]);
				Principal.dots.put("Flight", (String)dot[13]);
				Principal.dots.put("Vspeed", (int)dot[15]);
				Principal.dots.put("Callsign", (String)dot[16]);
				Principal.dots.put("DotID", dateToString((long)dot[10]) + (String)dot[16]);
				Principal.dots.put("Eta", (String)dot[17]);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
}
