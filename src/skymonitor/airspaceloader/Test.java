package skymonitor.airspaceloader;

import java.io.*;

public class Test{
	
	public static void main(String[] args) {
		try {
			String fichier = "uk_air_2002.txt";
			InputStream ips = new FileInputStream(fichier);
			InputStreamReader ipsr=new InputStreamReader(ips);
			BufferedReader br=new BufferedReader(ipsr);
			String line;
			
			int count = 0; 
			
			while ((line=br.readLine()) != null) {
				if (line.startsWith("AC ")) {
					count++;
				}
			}
			br.close();
			
			System.out.println(count);
		}
		catch (Exception e) {
			System.out.println(e.toString());
		}
	}
}