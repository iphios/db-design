'use strict';

// (function() {
  const Table = class {
    static generateHtml(data) {
      const thead = [];
      const tbody = [];
      const tfoot = [];

      thead.push(`
        <tr class="caption">
          <th class="table-name" colspan="3">
            ${data.name}
          </th>
          <th class="table-ops">
            <img crossorigin="anonymous" src="./table-edit.png" class="edit-table" />
          </th>
        </tr>
      `);
      data.columns.forEach(field => {
        tbody.push(`
          <tr data-id="${field.id}">
            <td>
              <img crossorigin="anonymous" src="./table-edit.png" />
            </td>
            <td>${field.name}</td>
            <td>${field.type}${field.size}</td>
            <td>
              <img crossorigin="anonymous" src="./edit.png" />
              <img crossorigin="anonymous" src="./updown.png" />
            </td>
          </tr>
        `);
      });
      tfoot.push(`
        <tr>
          <td colspan="4" class="action">
            <img crossorigin="anonymous" src="./table-row-add.png" />
            <span>Add field</span>
          </td>
        </tr>
      `);
      return `
        <thead>${thead.join('')}</thead>
        <tbody class="ui-sortable">${tbody.join('')}</tbody>
        <tfoot>${tfoot.join('')}</tfoot>
      `;
    }
    static renderHtml(data) {
      const $el = $('.canvas-container').find(`[data-id="${data.id}"]`);
      const html = Table.generateHtml(data);
      if ($el.length) {
        $el.html(html);
      } else {
        $('.canvas-container').append(`
          <table data-id="${data.id}" class="entity-table ui-draggable" style="left: ${data.position.left}px; top: ${data.position.top}px;">
            ${html}
          </table>
        `);
        $('.canvas-container').find(`[data-id="${data.id}"]`).draggable({
          handle: 'tr.caption',
          scroll: false,
          opacity: .8,
          stop: function(event, _ui) {
            const $el = $(event.target);
            const id = $el.data('id');
            const data = DbDesign.currentSchemaObj.tables.find(each => each.id === id);
            if (data) {
              const cssValue = $el.css(['left', 'top']);
              data.position.left = parseInt(cssValue.left);
              data.position.top = parseInt(cssValue.top);
            }
          }
        });
      }
    }
  };

  const Controller = class {
    static fullScreen() {
      DbDesign.fullscreen().toggle();
    }
    static newSchema() {
      setTimeout(async function() {
        const name = window.prompt('Please enter new schema name');
        if (name) {
          const schemaId = DbDesign.uuid();
          const time = new Date().getTime();

          const tx = window.idb.dbdesign.transaction(['schemas'], 'readwrite');
          const store = tx.objectStore('schemas');
          await store.put({
            id: schemaId,
            name: name,
            tables: [],
            created_at: time,
            updated_at: time
          })
          await tx.done;

          DbDesign.loadSchema(schemaId);
        }
      }, 0);
    }
    static async saveSchema() {
      const tx = window.idb.dbdesign.transaction(['schemas'], 'readwrite');
      const store = tx.objectStore('schemas');
      await store.put(DbDesign.currentSchemaObj);
      await tx.done;

      $.notify('Schema saved', {
        globalPosition: 'top center',
        className: 'success'
      });
    }
    static newTable(left, top) {
      setTimeout(async function() {
        const name = window.prompt('Please enter new table name');
        if (name) {
          const tableId = DbDesign.uuid();
          const obj = {
            id: tableId,
            name: name,
            color: '#ffffff',
            position: {
              left: left,
              top: top
            },
            columns: []
          };
          DbDesign.currentSchemaObj.tables.push(obj);
          Table.renderHtml(obj);
        }
      }, 0);
    }
    static deleteTable(id) {
      const idx = DbDesign.currentSchemaObj.tables.findIndex(each => each.id === id);
      if (idx !== -1) {
        $(`[data-id="${id}"]`).remove();
        DbDesign.currentSchemaObj.tables.splice(idx, 1);
      }
    }
  };

  const DbDesign = class {
    static currentSchemaObj = null;

    static fullscreen() {
      return (function() {
        const doc = window.document;
        const docEl = doc.documentElement;
        const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        const request = function() {
          if (!isActive()) requestFullScreen.call(docEl);
        };
        const exit = function() {
          if (isActive()) cancelFullScreen.call(doc);
        };
        const isActive = function() {
          return !(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement);
        };
        const toggle = function() {
          isActive() ? exit() : request();
        };
        return {
          request: request,
          exit: exit,
          isActive: isActive,
          toggle: toggle
        };
      })();
    }
    static uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    static getCurrentLineType() {
      const allowed_line_type = ['bezier', 'corners'];
      if (window.localStorage.line_type === undefined || allowed_line_type.includes(window.localStorage.line_type) === false) {
        window.localStorage.line_type = allowed_line_type[0];
      }

      return window.localStorage.line_type;
    }
    static async loadSchema(schemaId) {
      const tx = window.idb.dbdesign.transaction(['schemas'], 'readonly');
      const store = tx.objectStore('schemas');
      const obj = await store.get(schemaId)
      await tx.done;

      DbDesign.currentSchemaObj = obj;
      $('.toolbar').text(obj.name);
      DbDesign.currentSchemaObj.tables.forEach(table => {
        Table.renderHtml(table);
      });
    }
    static async getAllSchemas() {
      const tx = window.idb.dbdesign.transaction(['schemas'], 'readonly');
      const store = tx.objectStore('schemas');
      const allSchemas = await store.getAllKeys();
      await tx.done;
      return allSchemas;
    }
    static initCanvas() {
      const canvas = document.getElementById('graph');
      const context = canvas.getContext('2d');

      const newImage = new Image();
      newImage.setAttribute('crossOrigin', 'anonymous');
      newImage.addEventListener('load', (event) => {
        canvas.width = (event.target.width * 48) + 1;
        canvas.height = (event.target.height * 30) + 1;

        for (let w = 0; w < canvas.width; w += event.target.width) {
          for (let h = 0; h < canvas.height; h += event.target.height) {
            context.drawImage(newImage, w, h);
          }
        }
      });
      newImage.src = 'https://raw.githubusercontent.com/sai5171/db-design/main/docs/graph.png';
    }
    static initEvents() {
      const windowResizeHandler = function() {
        $('.canvas-container').css({
          'width': `${window.innerWidth}px`,
          'height': `${window.innerHeight}px`
        })
      };
      const windowDocument = {
        contextmenuHandler: async function(event) {
          const $el = $(event.target);
          const isTable = $el.hasClass('.entity-table') || $el.parents('.entity-table').length;
          let tableId = null;
          if (isTable) {
            tableId = $el.data('id') || $el.parents('.entity-table').data('id');
          }
          const isCurrentSchemaPresent = DbDesign.currentSchemaObj !== null;

          $('ul.context-menu').html(`
            ${isTable ? `<li class="menu-item" data-value="delete_table" data-id="${tableId}">Delete Table</li>` : ''}
            ${!isTable && isCurrentSchemaPresent ? `
              <li class="menu-item" data-value="new_table">New Table</li>
              <li class="menu-item" data-value="save_schema">Save Schema</li>
              <li class="menu-item" data-value="delete_schema">Delete Schema</li>
              ` : ''}
            ${!isTable ? '<li class="menu-item" data-value="new_schema">New Schema</li>' : ''}
            ${!isTable && (await DbDesign.getAllSchemas()).length !== 0 ? '<li class="menu-item" data-value="load_schema">Load Schema</li>' : ''}
            ${!isTable ? '<li class="menu-item" data-value="import_schema">Import Schema</li>' : ''}
            ${!isTable && isCurrentSchemaPresent ? '<li class="menu-item" data-value="export_schema">Export Schema</li>' : ''}
            ${isTable ? `
              <li class="menu-item-separator">&nbsp;</li>
              <li class="menu-item-action menu-item-action-color">
                <span title="maroon" class="table-color table-color-maroon" data-color="#800040"></span>
                <span title="ocean" class="table-color table-color-ocean" data-color="#004080"></span>
                <span title="teal" class="table-color table-color-teal" data-color="#008080"></span>
                <span title="asparagus" class="table-color table-color-asparagus" data-color="#808000"></span>
                <span title="strawberry" class="table-color table-color-strawberry" data-color="#ff0080"></span>
                <span title="iron" class="table-color table-color-iron" data-color="#505050"></span>
                <br />
                <span title="red" class="table-color table-color-red" data-color="#cc3333"></span>
            		<span title="blue" class="table-color table-color-blue" data-color="#1586d6"></span>
            		<span title="green" class="table-color table-color-green" data-color="#008000"></span>
            		<span title="orange" class="table-color table-color-orange" data-color="#ff8000"></span>
            		<span title="purple" class="table-color table-color-purple" data-color="#7f007f"></span>
            		<span title="white" class="table-color table-color-white" data-color="#fffff"></span>
              </li>
              ` : ''}
            <li class="menu-item-separator">&nbsp;</li>
            <li class="menu-item" data-value="full_screen">${DbDesign.fullscreen().isActive() ? 'Exit Full Screen' : 'Full Screen'}</li>
            ${isCurrentSchemaPresent ? `
              <li class="menu-item" data-value="gen_sql">Genereate SQL</li>
              <li class="menu-item" data-value="gen_image">Genereate Image</li>
              ` : ''}
            <li class="menu-item-separator">&nbsp;</li>
            <li class="menu-item-action menu-item-action-line-type">
              <label><input type="radio" name="line_type" value="bezier" ${DbDesign.getCurrentLineType() == 'bezier' ? 'checked' : ''} /><span>Bezier</span></label>
              <label><input type="radio" name="line_type" value="cornered" ${DbDesign.getCurrentLineType() == 'corners' ? 'checked' : ''} /><span>Corners</span></label>
              <span>&nbsp;</span>
            </li>
          `);

          const contextMenuDimensions = {
            width: $('ul.context-menu').outerWidth(),
            heigth: $('ul.context-menu').outerHeight()
          };
          const bufferSpace = 25;
          const contextMenupoint = {
            left: (event.pageX + contextMenuDimensions.width + bufferSpace) < window.innerWidth ? event.pageX : event.pageX - contextMenuDimensions.width,
            top: (event.pageY + contextMenuDimensions.heigth + bufferSpace) < window.innerHeight ? event.pageY : event.pageY - contextMenuDimensions.heigth
          };
          $('ul.context-menu').css(contextMenupoint).addClass('show');
        },
        clickHandler: function(event) {
          const $el = $(event.target);
          if (!$el.hasClass('menu-item-action') && !$el.parents('.menu-item-action').length) {
            $('ul.context-menu').removeClass('show');
          }
        },
        keyHandler: function() {
          let keyMap = {};
          return function(event) {
            if (event.repeat) return;
            keyMap[event.key] = event.type === 'keydown';
            if (keyMap['Escape'] == true) {
              keyMap = {};
              $('ul.context-menu').removeClass('show');
            } else if (keyMap['Alt'] == true && (keyMap['s'] == true || keyMap['S'] == true)) {
              keyMap = {};
              Controller.saveSchema();
            }
          };
        }
      };
      const canvasContainer = {
        clicked: false,
        left: 0,
        top: 0,
        ratio: Math.pow(2, 0),
        needForRAF: true,
        mousemoveHandler: function(event) {
          if (canvasContainer.isMouseDown) {
            if (canvasContainer.needForRAF) {
              canvasContainer.needForRAF = false;
              window.requestAnimationFrame(function() {
                canvasContainer.needForRAF = true;
                const xChange = (canvasContainer.left - event.pageX) / canvasContainer.ratio,
                  ychange = (canvasContainer.top - event.pageY) / canvasContainer.ratio;
                $('.canvas-container')
                  .scrollLeft($('.canvas-container').scrollLeft() + xChange)
                  .scrollTop($('.canvas-container').scrollTop() + ychange);
                canvasContainer.left = event.pageX;
                canvasContainer.top = event.pageY;
              });
            }
          }
        },
        mousedownHandler: function(event) {
          if (event.target.id == 'graph') {
            canvasContainer.isMouseDown = true;
            canvasContainer.left = event.pageX;
            canvasContainer.top = event.pageY;
          }
        },
        mouseupHandler: function() {
          canvasContainer.isMouseDown = false;
        }
      };
      const contextMenu = {
        clickHandler: function(event) {

          const $this = $(this);
          const value = $this.data('value');
          if (['new_table', 'new_schema', 'full_screen'].includes(value)) {
            $('ul.context-menu').removeClass('show');
          }
          if (value === 'new_table') {
            Controller.newTable(event.pageX, event.pageY);
          } else if (value == 'delete_table') {
            Controller.deleteTable($this.data('id'));
          } else if (value == 'new_schema') {
            Controller.newSchema();
          } else if (value == 'save_schema') {
            Controller.saveSchema();
          } else if (value == 'full_screen') {
            Controller.fullScreen();
          }
        }
      };
      window.addEventListener('resize', windowResizeHandler);
      $(window.document).on({
        contextmenu: windowDocument.contextmenuHandler,
        click: windowDocument.clickHandler,
        keyup: windowDocument.keyHandler(),
        keydown: windowDocument.keyHandler()
      });
      $('.canvas-container').on({
        mousemove: canvasContainer.mousemoveHandler,
        mousedown: canvasContainer.mousedownHandler,
        mouseup: canvasContainer.mouseupHandler
      });
      $('ul.context-menu').on({
        click: contextMenu.clickHandler
      }, 'li');
    }
    static async initIdb() {
      let isSuccess = true;
      try {
        if (!('indexedDB' in window)) {
          throw new Error('This browser doesn\'t support IndexedDB');
        }

        window.idb.dbdesign = await window.idb.openDB('dbdesign', 1, {
          upgrade(upgradeDB, oldVersion, newVersion, _transaction) {
            console.log(`[indexedDB] version upgrade from v${oldVersion} to v${newVersion}`);

            if (!upgradeDB.objectStoreNames.contains('schemas')) {
              upgradeDB.createObjectStore('schemas', {
                keyPath: 'id',
                autoIncrement: false
              });
            }
          },
          blocked(_event) {},
          blocking(event) {
            console.log('[indexedDB] database is outdated, so closing and reloading page');
            event.target.close();
            setTimeout(() => window.location.reload(), 3e3);
          },
          terminated(_event) {}
        });
      } catch (err) {
        isSuccess = false;
        console.log(`[indexedDB] ${err}`);
      } finally {
        if (isSuccess) {

          // close indexedDB on before unload event
          window.addEventListener('beforeunload', function(_event) {
            window.idb.unwrap(window.idb.dbdesign).close();
            return null;
          });
        }
      }
    }
    static async init() {
      DbDesign.initCanvas();
      DbDesign.initEvents();
      await DbDesign.initIdb();

      const tx = window.idb.dbdesign.transaction(['schemas'], 'readonly');
      const store = tx.objectStore('schemas');
      const schemas = await store.getAll();
      await tx.done;

      window.dispatchEvent(new Event('resize'));
      const latestSchema = schemas.sort((a, b) => a.updated_at < b.updated_at ? 1 : -1)[0];
      if (latestSchema !== undefined) {
        await DbDesign.loadSchema(latestSchema.id);
      }
      $('body').addClass('show');
    }
  };

  // on dom ready
  $(function() {
    DbDesign.init();
  });
// })();
