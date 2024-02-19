using System.Collections.Generic;
using CodeMechanic.RazorHAT;
using Microsoft.AspNetCore.Html;

namespace Trash Stack.Pages.Sandbox;

public class CerealTable
{
    public List<Cereal> Rows = new List<Cereal>()
    {
        new Cereal { name = "Cap'n Crunch", cost = 15.00 },
        new Cereal { name = "Cookie Crisp", cost = 15.00 },

        new Cereal
        {
            name = "Frankenberry",
            cost = 16.00
        }
    };
}

public record Cereal
{
    public string name { get; set; }
    public double cost { get; set; }

    public HtmlString ToHtml()
    {
        return $"<td>{name}</td><td>{cost}</td>".AsHTMLString();
    }
}