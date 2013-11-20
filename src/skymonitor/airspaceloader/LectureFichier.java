package skymonitor.airspaceloader;

import java.io.*;

import com.mongodb.*;

import java.net.UnknownHostException;
import java.util.List;
import java.util.LinkedList;

public class LectureFichier {
		
	public static void main(String[] args) {
		try {
			Mongo mongo = new Mongo ("localhost", 27017);
			DB db = mongo.getDB("db");
			DBCollection zones = db.getCollection("zonesUk");
			
			ACCase AC = new ACCase();
			AHCase AH = new AHCase();
			ALCase AL = new ALCase();
			ANCase AN = new ANCase();
			VDirCase Vdir = new VDirCase();
			VPointCase Vpoint = new VPointCase();
			DPCase DP = new DPCase();
			DACase DA = new DACase();
			DBCase DB = new DBCase();
			DCCase DC = new DCCase();
			
			Case[] Possibilites = {AC,AH,AL,AN,Vdir,Vpoint,DP,DA,DB,DC};
			
			String fichier = "uk_air_2002.txt";
			
			try {
				InputStream ips = new FileInputStream(fichier);
				InputStreamReader ipsr=new InputStreamReader(ips);
				BufferedReader br=new BufferedReader(ipsr);
				String line;
				BasicDBObject occ = new BasicDBObject();
				occ.put("Starter", 0);
				
				int lineNbr = 0;
				List errorReport = new LinkedList();
				
				while ((line=br.readLine()) != null) {
					lineNbr++;
					System.out.println(line);
					String Line = line.toUpperCase();
					for (Case poss : Possibilites) {
						if (poss.matches(Line)) {
							try {
								poss.execute(Line, occ, zones);
							} catch (Exception e) {
								errorReport.add(lineNbr);
							}
						}
					}
				}
				br.close();
				
				occ.removeField("Vpoint");
				occ.removeField("Vdir");
				zones.insert(occ);
				
				BasicDBObject Starter = new BasicDBObject();
				Starter.put("Starter", 0);
				zones.remove(Starter);
				
				System.out.println(errorReport);
			}
			catch (Exception e) {
				System.out.println(e.toString());
			}
		}
		catch (UnknownHostException e) {
			e.printStackTrace();
		} catch (MongoException e) {
			e.printStackTrace();
		}
	}
}
