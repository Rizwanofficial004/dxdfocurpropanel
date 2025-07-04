from dashboard.download_screenshots import run_on_project_start

def main():
    # Trigger the screenshot download process
    run_on_project_start()

    # ...existing project initialization code...

if __name__ == "__main__":
    main()
