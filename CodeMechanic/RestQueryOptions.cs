using System.Text;
using CodeMechanic.Advanced.Regex;

namespace CodeMechanic.Rest;

public class RestQueryOptions
{
    public string bearer_token { get; set; } = string.Empty;

    public string execution_method { get; set; } = string.Empty;

    public string raw_headers { get; set; } = string.Empty;


    public string uri { get; set; } = string.Empty;

    // public static CurlOptions None = new();
    public override string ToString()
    {
        var sb = new StringBuilder();
        sb.AppendLine("headers=" + this.raw_headers);
        sb.AppendLine("bt=" + this.bearer_token);
        sb.AppendLine("method=" + this.execution_method);
        return sb.ToString();
    }
}