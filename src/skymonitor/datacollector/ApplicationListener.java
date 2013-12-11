package skymonitor.datacollector;

import java.io.File;
import java.util.logging.Logger;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class ApplicationListener implements ServletContextListener {
    private static Logger logger = Logger.getLogger("ApplicationListener");

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        logger.info("class : context destroyed");

    }

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        ServletContext context = servletContextEvent.getServletContext();
        Principal.server = context.getInitParameter("mongoserver");
        Principal.database = context.getInitParameter("mongodatabase");
        Principal.databaseInstance = new Database(Principal.server, Principal.database, Principal.collection);
        
        Principal.main();
        logger.info("myapp : context Initialized");
    }



}