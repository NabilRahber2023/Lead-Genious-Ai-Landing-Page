
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const ChartCard = ({ title, description, children, itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {children}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChartCard;
