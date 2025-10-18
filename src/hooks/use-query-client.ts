"use client";

import { useQueryClient } from "@tanstack/react-query";

export const useRQClient = () => {
  return useQueryClient();
};