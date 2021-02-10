using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Crafts.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        public DateTime OrderPlaced { get; set; }
        public DateTime? OrderFulfilled { get; set; }
        public int CustomerId { get; set; }
        public Kunde Customer  { get; set; }

        public ICollection<ProductOrder> ProductsOrders { get; set; }




    }
}
