import tkinter as tk
from tkinter import ttk
import pytesseract
from PIL import ImageGrab, Image
import googletrans
from googletrans import Translator
import threading

class OCRTranslator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("OCR Переводчик")
        self.root.geometry("400x300")
        
        self.translator = Translator()
        self.running = False
        
        self.setup_ui()
        
    def setup_ui(self):
        # Кнопка запуска/остановки
        self.toggle_btn = ttk.Button(self.root, text="Запустить", command=self.toggle_scan)
        self.toggle_btn.pack(pady=10)
        
        # Поле для исходного текста
        ttk.Label(self.root, text="Распознанный текст:").pack()
        self.source_text = tk.Text(self.root, height=5, width=50)
        self.source_text.pack(pady=5)
        
        # Поле для перевода
        ttk.Label(self.root, text="Перевод:").pack()
        self.translated_text = tk.Text(self.root, height=5, width=50)
        self.translated_text.pack(pady=5)
        
        # Статус
        self.status_var = tk.StringVar(value="Готов")
        status_label = ttk.Label(self.root, textvariable=self.status_var)
        status_label.pack()
        
    def toggle_scan(self):
        if not self.running:
            self.running = True
            self.toggle_btn.config(text="Остановить")
            self.start_scanning()
        else:
            self.running = False
            self.toggle_btn.config(text="Запустить")
            self.status_var.set("Остановлено")
            
    def start_scanning(self):
        def scan_loop():
            while self.running:
                try:
                    # Делаем скриншот выделенной области
                    screenshot = ImageGrab.grabclipboard()
                    
                    if isinstance(screenshot, Image.Image):
                        # Распознаем текст
                        text = pytesseract.image_to_string(screenshot, lang='rus+eng')
                        
                        if text.strip():
                            # Обновляем UI в основном потоке
                            self.root.after(0, self.update_text, text)
                            
                except Exception as e:
                    print(f"Ошибка: {e}")
                
                # Пауза между проверками
                threading.Event().wait(2)
                
        thread = threading.Thread(target=scan_loop, daemon=True)
        thread.start()
        
    def update_text(self, text):
        self.source_text.delete(1.0, tk.END)
        self.source_text.insert(1.0, text)
        
        # Переводим текст
        try:
            translation = self.translator.translate(text, dest='ru').text
            self.translated_text.delete(1.0, tk.END)
            self.translated_text.insert(1.0, translation)
            self.status_var.set("Текст переведен")
        except:
            self.status_var.set("Ошибка перевода")
            
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = OCRTranslator()
    app.run()
