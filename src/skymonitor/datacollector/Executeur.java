package skymonitor.datacollector;

import com.mongodb.*;
import com.mongodb.util.JSON;
import java.util.Collection;
import java.util.Iterator;

public class Executeur {
	void main() {
		String fluxString = Principal.flux.toString().replace("pd_callback(","").replace(");","");
		DBObject dotsObj = (DBObject)JSON.parse(fluxString);
		Collection<Object[]> dots = dotsObj.toMap().values();
		Iterator<Object[]> fluxIterator = dots.iterator();
	}
}
