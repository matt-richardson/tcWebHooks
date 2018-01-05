package webhook.teamcity.history;

import java.net.MalformedURLException;
import java.net.URL;

import jetbrains.buildServer.serverSide.ProjectManager;
import jetbrains.buildServer.serverSide.SBuild;
import jetbrains.buildServer.serverSide.SBuildType;
import jetbrains.buildServer.serverSide.SProject;
import webhook.WebHookExecutionStats;
import webhook.teamcity.history.WebHookHistoryItem.WebHookErrorStatus;
import webhook.teamcity.reporting.WebAddressTransformer;
import webhook.teamcity.settings.WebHookConfig;

public class WebHookHistoryItemFactoryImpl implements WebHookHistoryItemFactory {
	
	private final WebAddressTransformer myWebAddressTransformer;
	private final ProjectManager myProjectManager;
	
	public WebHookHistoryItemFactoryImpl(WebAddressTransformer webAddressTransformer, ProjectManager projectManager) {
		myWebAddressTransformer = webAddressTransformer;
		myProjectManager = projectManager;
	}
	
	public WebHookHistoryItem getWebHookHistoryItem(WebHookConfig whc, 
													WebHookExecutionStats webHookExecutionStats, 
													SBuild sBuild, 
													WebHookErrorStatus errorStatus) {
		WebHookHistoryItem item =  new WebHookHistoryItem(whc, webHookExecutionStats, sBuild, errorStatus);
		addGeneralisedWebAddress(whc, item);
		addSProject(item);
		addBuildTypeData(item);
		return item;
		
	}

	@Override
	public WebHookHistoryItem getWebHookHistoryItem(WebHookConfig whc, WebHookExecutionStats webHookExecutionStats,
			SBuildType sBuildType, WebHookErrorStatus errorStatus) {
		WebHookHistoryItem item =  new WebHookHistoryItem(whc, webHookExecutionStats, sBuildType, errorStatus);
		addGeneralisedWebAddress(whc, item);
		addSProject(item);
		addBuildTypeData(item);
		return item;
	}

	@Override
	public WebHookHistoryItem getWebHookHistoryItem(WebHookConfig whc, WebHookExecutionStats webHookExecutionStats,
			SProject project, WebHookErrorStatus errorStatus) {
		WebHookHistoryItem item =  new WebHookHistoryItem(whc, webHookExecutionStats, project, errorStatus);
		addGeneralisedWebAddress(whc, item);
		addSProject(item);
		addBuildTypeData(item);
		return item;
	}
	
	private void addGeneralisedWebAddress(WebHookConfig whc, WebHookHistoryItem item) {
		try {
			URL url = new URL(whc.getUrl());
			item.setGeneralisedWebAddress(myWebAddressTransformer.getGeneralisedHostName(url));
		} catch (MalformedURLException ex) {
			item.setGeneralisedWebAddress(null);
		}
	}
	
	private void addSProject(WebHookHistoryItem item) {
		item.setSProject(myProjectManager.findProjectById(item.getProjectId()));
	}
	
	private void addBuildTypeData(WebHookHistoryItem item) {
		item.setBuildTypeName(myProjectManager.findBuildTypeById(item.getBuildTypeId()).getName());
		item.setBuildTypeExternalId(myProjectManager.findBuildTypeById(item.getBuildTypeId()).getExternalId());
	}

}
