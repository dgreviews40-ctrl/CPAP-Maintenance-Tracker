"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface LowStockItem {
  id: string;
  part_model_label: string;
  quantity: number;
  reorder_threshold: number;
}

const LowInventoryWidget = () => {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("part_inventory")
        .select("id, part_model_label, quantity, reorder_threshold")
        .lte("quantity", "reorder_threshold"); // This is the key filter condition

      if (error) {
        console.error("Error fetching low stock items:", error);
      } else if (data) {
        // Additional client-side filter in case the RLS/query is complex
        const lowStock = data.filter(item => item.quantity <= item.reorder_threshold);
        setItems(lowStock);
      }
      setLoading(false);
    };

    fetchLowStockItems();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" /> Low Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Package className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <Warehouse className="h-8 w-8 mx-auto mb-2" />
            <p>All parts are well-stocked.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map(item => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span className="font-medium truncate pr-2">{item.part_model_label}</span>
                <span className="text-red-500 font-semibold">
                  {item.quantity} left
                </span>
              </li>
            ))}
             <li className="pt-4 border-t">
                <Link to="/inventory">
                    <Button variant="secondary" size="sm" className="w-full">
                        Manage Full Inventory
                    </Button>
                </Link>
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default LowInventoryWidget;