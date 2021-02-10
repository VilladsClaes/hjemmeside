using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Crafts.Models
{
    public class ProductOrder
    {
        [Key]
        public int Id { get; set; }
        public int Quantity { get; set; }
        
        
        public int ProductId { get; set; }
        public int OrderId { get; set; }
        public Order Order { get; set; }
        public Produkt Produkter { get; set; }




    }
}
