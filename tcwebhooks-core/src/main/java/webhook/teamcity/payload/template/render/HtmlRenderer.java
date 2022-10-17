package webhook.teamcity.payload.template.render;

import java.util.Map;

import org.apache.commons.lang3.StringEscapeUtils;

public class HtmlRenderer implements WebHookStringRenderer {

	@Override
	public String render(String input) {
		return StringEscapeUtils.escapeHtml4(input);
	}


	@Override
	public String render(Map<String, String[]> input) throws WebHookHtmlRendererException {
		throw new WebHookHtmlRendererException("Not expecting a Map<String,String[]>.");
	}

}
