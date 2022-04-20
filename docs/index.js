'use strict';

// (function() {
  const Table = class {
    static uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  const DbDesign = class {
    static currentSchemaId = null;

    static async getAllSchemas() {
      let allSchemas = [];
      try {
        const tx = window.idb.dbdesign.transaction(['schemas'], 'readonly');
        const store = tx.objectStore('schemas');
        allSchemas = await store.getAllKeys();
        await tx.done;
      } catch (err) {
        console.log(`[indexedDB] ${err}`);
      }
      return allSchemas;
    }
    static getCurrentLineType() {
      const allowed_line_type = ['bezier', 'corners'];
      if (window.localStorage.line_type === undefined || allowed_line_type.includes(window.localStorage.line_type) === false) {
        window.localStorage.line_type = allowed_line_type[0];
      }

      return window.localStorage.line_type;
    }
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
    static initEvents() {
      const windowDocument = {
        contextmenuHandler: async function(event) {
          const html = `
            ${
              DbDesign.currentSchemaId !== null ? `
              <li class="menu-item" data-value="new_table">New Table</li>
              <li class="menu-item" data-value="save_schema">Save Schema</li>
              ` : ''
            }
            <li class="menu-item" data-value="new_schema">New Schema</li>
            ${(await DbDesign.getAllSchemas()).length !== 0 ? '<li class="menu-item" data-value="load_schema">Load Schema</li>' : ''}
            <li class="menu-item" data-value="import_schema">Import Schema</li>
            ${DbDesign.currentSchemaId !== null ? '<li class="menu-item" data-value="export_schema">Export Schema</li>': ''}
            <li class="menu-item-separator">&nbsp;</li>
            <li class="menu-item" data-value="full_screen">${DbDesign.fullscreen().isActive() ? 'Exit Full Screen' : 'Full Screen'}</li>
            ${
              DbDesign.currentSchemaId !== null ? `
              <li class="menu-item" data-value="gen_sql">Genereate SQL</li>
              <li class="menu-item" data-value="gen_image">Genereate Image</li>
              `: ''
            }
            <li class="menu-item-separator">&nbsp;</li>
            <li class="menu-item-action">
              <label><input type="radio" name="line_type" value="bezier" ${DbDesign.getCurrentLineType() == 'bezier' ? 'checked' : ''} /><span>Bezier</span></label>
              <label><input type="radio" name="line_type" value="cornered" ${DbDesign.getCurrentLineType() == 'corners' ? 'checked' : ''} /><span>Corners</span></label>
              <span>&nbsp;</span>
            </li>
          `;
          $('ul.context-menu').html(html);
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
          const keyMap = {};
          return function(event) {
            if (event.repeat) return;
            keyMap[event.key] = event.type === 'keydown';
            if (keyMap['Escape'] == true) {
              $(window.document).trigger('click');
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
          canvasContainer.isMouseDown = true;
          canvasContainer.left = event.pageX;
          canvasContainer.top = event.pageY;
        },
        mouseupHandler: function() {
          canvasContainer.isMouseDown = false;
        }
      };
      const contextMenu = {
        clickHandler: function() {
          const $this = $(this);
          const value = $this.data('value');
          if (value === 'new_table') {
            const table = {
              id: uuid()
            }
            // const new_table = Table
            // $('.canvas-container').append(new_table);
          }
        }
      };
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
          blocked(_event) {
          },
          blocking(event) {
            console.log('[indexedDB] database is outdated, so closing and reloading page');
            event.target.close();
            setTimeout(() => window.location.reload(), 3e3);
          },
          terminated(_event) {
          }
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
      DbDesign.initEvents();
      await DbDesign.initIdb();
      $('body').addClass('show');
    }
  }

  // on dom ready
  $(function() {
    DbDesign.init();
  });
// })();
