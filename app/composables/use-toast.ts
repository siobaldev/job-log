type ToastItem = {
  id: number;
  type: "success" | "error";
  title: string;
  description?: string;
};

let nextId = 0;

export function useToast() {
  const toasts = useState<ToastItem[]>("toasts", () => []);

  function add(type: ToastItem["type"], title: string, description?: string) {
    toasts.value.push({ id: nextId++, type, title, description });
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  return {
    toasts,
    remove,
    success: (title: string, description?: string) => add("success", title, description),
    error: (title: string, description?: string) => add("error", title, description),
  };
}
