package webhook.teamcity.test.jerseyprovider;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.lang.reflect.Type;

import javax.ws.rs.core.Context;
import javax.ws.rs.ext.Provider;

import org.springframework.web.context.ContextLoader;

import com.sun.jersey.core.spi.component.ComponentContext;
import com.sun.jersey.core.spi.component.ComponentScope;
import com.sun.jersey.spi.inject.Injectable;
import com.sun.jersey.spi.inject.InjectableProvider;

import jetbrains.buildServer.RootUrlHolder;
import jetbrains.buildServer.server.rest.data.PermissionChecker;
import jetbrains.buildServer.serverSide.ProjectManager;
import jetbrains.buildServer.serverSide.SBuildServer;
import jetbrains.buildServer.serverSide.SecurityContextEx;
import jetbrains.buildServer.serverSide.auth.AuthorityHolder;
import jetbrains.buildServer.serverSide.auth.Permission;
import webhook.teamcity.BuildTypeIdResolver;
import webhook.teamcity.ProjectIdResolver;
import webhook.teamcity.payload.WebHookTemplateManager;
import webhook.teamcity.server.rest.data.WebHookDataProvider;
import webhook.teamcity.server.rest.data.WebHookManager;
import webhook.teamcity.server.rest.request.Constants;
import webhook.teamcity.test.springmock.MockProjectManager;

@Provider
public class WebHookDataProviderTestContextProvider implements InjectableProvider<Context, Type>, Injectable<WebHookDataProvider> {
  private WebHookDataProvider dataProvider;
  private final SBuildServer sBuildServer;
  private final PermissionChecker permissionChecker;
  private final ProjectManager projectManager;
  @Context WebHookTemplateManager templateManager;
  private WebHookManager webHookManager;
  private final ProjectIdResolver projectIdResolver;
  private final BuildTypeIdResolver buildTypeIdResolver;
  private final SecurityContextEx securityContext;
  private final AuthorityHolder authorityHolder;
  
  
  public WebHookDataProviderTestContextProvider() {
	  System.out.println("We are here: Trying to provide a testable DataProvider instance");
	  sBuildServer = mock(SBuildServer.class);
	  permissionChecker = mock(PermissionChecker.class);
	  projectManager = new MockProjectManager();
	  projectIdResolver = mock(ProjectIdResolver.class);
	  buildTypeIdResolver = mock(BuildTypeIdResolver.class);
	  securityContext = mock(SecurityContextEx.class);
	  authorityHolder = mock(AuthorityHolder.class);
	  when(securityContext.getAuthorityHolder()).thenReturn(authorityHolder);
	  when(authorityHolder.isPermissionGrantedForAnyProject(eq(Permission.EDIT_PROJECT))).thenReturn(true);
	  //templateFinder = mock(TemplateFinder.class);
  }

  public ComponentScope getScope() {
    return ComponentScope.Singleton;
  }

  public Injectable<WebHookDataProvider> getInjectable(final ComponentContext ic, final Context context, final Type type) {
    if (type.equals(WebHookDataProvider.class)) {
      return this;
    }
    return null;
  }

  public WebHookDataProvider getValue() {
	  if (dataProvider != null){
		  return dataProvider;
	  }
	  webHookManager = ContextLoader.getCurrentWebApplicationContext().getBean(WebHookManager.class);
	  //projectIdResolver = ContextLoader.getCurrentWebApplicationContext().getBean(ProjectIdResolver.class);
	  
	  dataProvider = new WebHookDataProvider(sBuildServer, new TestUrlHolder(), permissionChecker, projectManager, webHookManager, projectIdResolver, buildTypeIdResolver, securityContext);
	  return dataProvider;
  }
  
  public static class TestUrlHolder implements RootUrlHolder {
			String url = Constants.API_URL;  
			
			@Override
			public void setRootUrl(String rootUrl) {
				this.url = rootUrl;
				
			}
			
			@Override
			public String getRootUrl() {
				return url;
			}
	}  
}