package skymonitor.airspaceloader;

import java.io.*;

import com.mongodb.*;

import java.util.List;
import java.util.LinkedList;

import javax.servlet.http.*;

import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;

public class LectureFichier {
	
	public static String country;
	
	public static void completeAndInsert(BasicDBObject occ, DBCollection coll) {
		Case.closePolygon(occ);

		occ.removeField("Vpoint");
		occ.removeField("Vdir");
		occ.put("Country", country);
		coll.insert(occ);
	}
	
	public static void main(String[] args) {
		String fichier = "../sourceOpenAir.txt";
		country = "Fr";
		try {
			InputStream ips = new FileInputStream(fichier);
			loadZones(ips, "localhost", "db");
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 
	 * @param request
	 * @return
	 */
	
	public static String processRequest(HttpServletRequest request) {
		if ("POST".equals(request.getMethod())) {
			FileItemFactory factory = new DiskFileItemFactory();
			ServletFileUpload upload = new ServletFileUpload(factory);
			upload.setSizeMax(10000000);// 10 Mo
			
			try {
				List<FileItem> files = upload.parseRequest(request);
				for (FileItem file : files) {
					if (file.isFormField()) {
						country = file.getString();
					}
					else {
						String server = request.getServletContext().getInitParameter("mongoserver");
						String database = request.getServletContext().getInitParameter("mongodatabase");
						loadZones(file.getInputStream(), server, database);
						return "Zone charg&eacute;e pour le pays : " + country;
					}
				}
			} catch (IOException ioe) {
				ioe.printStackTrace();
			} catch (FileUploadException e) {
				e.printStackTrace();
			}
			
			return request.getParameter("airspace");
			
		}
		
		return "Chargement d'un fichier : (" + request.getServletContext().getInitParameter("mongodatabase") +")";
	}

	public static void loadZones(InputStream ips, String server, String database) {
		try {
			Mongo mongo = new Mongo(server, 27017);
			DB db = mongo.getDB(database);
			DBCollection zones = db.getCollection("zones");

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

			Case[] Possibilites = { AC, AH, AL, AN, Vdir, Vpoint, DP, DA, DB,
					DC };

			InputStreamReader ipsr = new InputStreamReader(ips);
			BufferedReader br = new BufferedReader(ipsr);
			String line;
			BasicDBObject occ = new BasicDBObject();
			occ.put("Starter", 0);

			int lineNbr = 0;
			List errorReport = new LinkedList();

			while ((line = br.readLine()) != null) {
				lineNbr++;
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
			
			completeAndInsert(occ,zones);

			BasicDBObject Starter = new BasicDBObject();
			Starter.put("Starter", 0);
			zones.remove(Starter);

			System.out.println(errorReport);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
