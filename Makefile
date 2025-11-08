PORT=8000
URL=http://localhost:$(PORT)

serve:
	@echo "🚀 Starting local server on $(URL)"
	@python3 -m webbrowser $(URL)
	@python3 -m http.server $(PORT)

