namespace pc {
    export namespace debug {
        var table: HTMLTableElement | null = null;
        var row: HTMLTableRowElement | null = null;
        var title: HTMLTableCellElement | null = null;
        var field: HTMLTableCellElement | null = null;

        export function display(data: any): void {
            function init() {
                table = document.createElement('table');
                row = document.createElement('tr');
                title = document.createElement('td');
                field = document.createElement('td');

                table.style.cssText = 'position:absolute;font-family:sans-serif;font-size:12px;color:#cccccc';
                table.style.top = '0px';
                table.style.left = '0px';
                table.style.border = 'thin solid #cccccc';

                document.body.appendChild(table);
            }

            if (!table) {
                init();
            }

            table!.innerHTML = '';
            var keys: string[] = Object.keys(data);
            var key: string;
            for (var i = 0; i < keys.length; i++) {
                key = keys[i];

                var r = row!.cloneNode();
                var t = title!.cloneNode();
                var f = field!.cloneNode();

                t.textContent = key;
                f.textContent = data[key];

                r.appendChild(t);
                r.appendChild(f);
                table!.appendChild(r);
            }
        }
    }
}
