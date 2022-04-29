'use strict';

(function() {
  const Table = class {
    static generateHtml(data) {
      const thead = [];
      const tbody = [];
      const tfoot = [];

      thead.push(`
        <tr class="caption ${data.color === '#dadada' ? '' : 'colored'} show" style="background-color: ${data.color};">
          <th class="table-name" colspan="3">
            ${data.name}
          </th>
          <th class="table-ops">
            <img crossorigin="anonymous" src="./table-edit.png" class="edit-table" />
          </th>
        </tr>
        <tr class="field-form">
          <th colspan="4">
            <form>
              <div class="field">
                <label>Table Name</label>
                <input type="text" name="name" />
              </div>
              <div class="field field-buttons">
                <span class="link">Cancel</span>
                <div>
                  <input type="button" class="table-save" value="Save">
                </div>
              </div>
            </form>
          </th>
        </tr>
      `);
      data.columns.sort((a, b) => a.position < b.position ? -1 : 1).forEach(field => {
        tbody.push(`
          <tr data-id="${field.id}" class="show">
            <td class="img">
              ${field.index === 'primary_0' && field.ai === false ? '<img crossorigin="anonymous" src="./key.png" />' : ''}
              ${field.index === 'primary_0' && field.ai === true ? '<img crossorigin="anonymous" src="./key_ai.png" />' : ''}
              ${field.index !== 'primary_0' && field.ai === true ? '<img crossorigin="anonymous" src="./ai.png" />' : ''}
              ${field.null === false ? '<img crossorigin="anonymous" src="./not_null.png" />' : ''}
            </td>
            <td>${field.name}</td>
            <td>${field.type}${field.size.length ? `(${field.size})` : ''}</td>
            <td>
              &nbsp;
              <img crossorigin="anonymous" class="edit-field" src="./edit.png" />
              <img crossorigin="anonymous" class="order-field" src="./updown.png" />
            </td>
          </tr>
          ${Table.fieldFormHtml(data.id, 'Update')}
        `);
      });
      tfoot.push(`
        <tr class="add-field-button show">
          <td colspan="4" class="action">
            <img crossorigin="anonymous" src="./table-row-add.png" />
            <span class="link">Add field</span>
          </td>
        </tr>
        ${Table.fieldFormHtml(data.id, 'Save')}
      `);
      return `
        <thead>${thead.join('')}</thead>
        <tbody class="ui-sortable">${tbody.join('')}</tbody>
        <tfoot>${tfoot.join('')}</tfoot>
      `;
    }
    static fieldFormHtml(id, button_text) {
      return `
        <tr class="field-form">
          <td colspan="4">
            <form>
              <div class="field">
                <label>Name</label>
                <input type="text" name="name" />
              </div>
              <div class="field">
                <label>Type</label>
                <select name="type">
                  <option title="A 4-byte integer, signed range is -2,147,483,648 to 2,147,483,647, unsigned range is 0 to 4,294,967,295" selected>INT</option>
                  <option title="A variable-length (0-65,535) string, the effective maximum length is subject to the maximum row size">VARCHAR</option>
                  <option title="A TEXT column with a maximum length of 65,535 (2^16 - 1) characters, stored with a two-byte prefix indicating the length of the value in bytes">TEXT</option>
                  <option title="A date, supported range is 1000-01-01 to 9999-12-31">DATE</option>
                  <optgroup label="Numeric">
                    <option title="A 1-byte integer, signed range is -128 to 127, unsigned range is 0 to 255">TINYINT</option>
                    <option title="A 2-byte integer, signed range is -32,768 to 32,767, unsigned range is 0 to 65,535">SMALLINT</option>
                    <option title="A 3-byte integer, signed range is -8,388,608 to 8,388,607, unsigned range is 0 to 16,777,215">MEDIUMINT</option>
                    <option title="A 4-byte integer, signed range is -2,147,483,648 to 2,147,483,647, unsigned range is 0 to 4,294,967,295">INT</option>
                    <option title="An 8-byte integer, signed range is -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807, unsigned range is 0 to 18,446,744,073,709,551,615">BIGINT</option>
                    <option disabled="disabled">-</option>
                    <option title="A fixed-point number (M, D) - the maximum number of digits (M) is 65 (default 10), the maximum number of decimals (D) is 30 (default 0)">DECIMAL</option>
                    <option title="A small floating-point number, allowable values are -3.402823466E+38 to -1.175494351E-38, 0, and 1.175494351E-38 to 3.402823466E+38">FLOAT</option>
                    <option title="A double-precision floating-point number, allowable values are -1.7976931348623157E+308 to -2.2250738585072014E-308, 0, and 2.2250738585072014E-308 to 1.7976931348623157E+308">DOUBLE</option>
                    <option title="Synonym for DOUBLE (exception: in REAL_AS_FLOAT SQL mode it is a synonym for FLOAT)">REAL</option>
                    <option disabled="disabled">-</option>
                    <option title="A bit-field type (M), storing M of bits per value (default is 1, maximum is 64)">BIT</option>
                    <option title="A synonym for TINYINT(1), a value of zero is considered false, nonzero values are considered true">BOOLEAN</option>
                    <option title="An alias for BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE">SERIAL</option>
                  </optgroup>
                  <optgroup label="Date and time">
                    <option title="A date, supported range is 1000-01-01 to 9999-12-31">DATE</option>
                    <option title="A date and time combination, supported range is 1000-01-01 00:00:00 to 9999-12-31 23:59:59">DATETIME</option>
                    <option title="A timestamp, range is 1970-01-01 00:00:01 UTC to 2038-01-09 03:14:07 UTC, stored as the number of seconds since the epoch (1970-01-01 00:00:00 UTC)">TIMESTAMP</option>
                    <option title="A time, range is -838:59:59 to 838:59:59">TIME</option>
                    <option title="A year in four-digit (4, default) or two-digit (2) format, the allowable values are 70 (1970) to 69 (2069) or 1901 to 2155 and 0000">YEAR</option>
                  </optgroup>
                  <optgroup label="String">
                    <option title="A fixed-length (0-255, default 1) string that is always right-padded with spaces to the specified length when stored">CHAR</option>
                    <option title="A variable-length (0-65,535) string, the effective maximum length is subject to the maximum row size">VARCHAR</option>
                    <option disabled="disabled">-</option>
                    <option title="A TEXT column with a maximum length of 255 (2^8 - 1) characters, stored with a one-byte prefix indicating the length of the value in bytes">TINYTEXT</option>
                    <option title="A TEXT column with a maximum length of 65,535 (2^16 - 1) characters, stored with a two-byte prefix indicating the length of the value in bytes">TEXT</option>
                    <option title="A TEXT column with a maximum length of 16,777,215 (2^24 - 1) characters, stored with a three-byte prefix indicating the length of the value in bytes">MEDIUMTEXT</option>
                    <option title="A TEXT column with a maximum length of 4,294,967,295 or 4GiB (2^32 - 1) characters, stored with a four-byte prefix indicating the length of the value in bytes">LONGTEXT</option>
                    <option disabled="disabled">-</option>
                    <option title="Similar to the CHAR type, but stores binary byte strings rather than non-binary character strings">BINARY</option>
                    <option title="Similar to the VARCHAR type, but stores binary byte strings rather than non-binary character strings">VARBINARY</option>
                    <option disabled="disabled">-</option>
                    <option title="A BLOB column with a maximum length of 255 (2^8 - 1) bytes, stored with a one-byte prefix indicating the length of the value">TINYBLOB</option>
                    <option title="A BLOB column with a maximum length of 65,535 (2^16 - 1) bytes, stored with a two-byte prefix indicating the length of the value">BLOB</option>
                    <option title="A BLOB column with a maximum length of 16,777,215 (2^24 - 1) bytes, stored with a three-byte prefix indicating the length of the value">MEDIUMBLOB</option>
                    <option title="A BLOB column with a maximum length of 4,294,967,295 or 4GiB (2^32 - 1) bytes, stored with a four-byte prefix indicating the length of the value">LONGBLOB</option>
                    <option disabled="disabled">-</option>
                    <option title="An enumeration, chosen from the list of up to 65,535 values or the special '' error value">ENUM</option>
                    <option title="A single value chosen from a set of up to 64 members">SET</option>
                    <option disabled="disabled">-</option>
                    <option title="Intended for storage of IPv6 addresses, as well as IPv4 addresses assuming conventional mapping of IPv4 addresses into IPv6 addresses">INET6</option>
                  </optgroup>
                  <optgroup label="Spatial">
                    <option title="A type that can store a geometry of any type">GEOMETRY</option>
                    <option title="A point in 2-dimensional space">POINT</option>
                    <option title="A curve with linear interpolation between points">LINESTRING</option>
                    <option title="A polygon">POLYGON</option>
                    <option title="A collection of points">MULTIPOINT</option>
                    <option title="A collection of curves with linear interpolation between points">MULTILINESTRING</option>
                    <option title="A collection of polygons">MULTIPOLYGON</option>
                    <option title="A collection of geometry objects of any type">GEOMETRYCOLLECTION</option>
                  </optgroup>
                  <optgroup label="JSON">
                    <option title="Stores and enables efficient access to data in JSON (JavaScript Object Notation) documents">JSON</option>
                  </optgroup>
                </select>
              </div>
              <div class="field">
                <label>Size</label>
                <input type="text" name="size" />
              </div>
              <div class="field">
                <label>Default</label>
                <select name="default">
                  <option value="NONE" selected>None </option>
                  <option value="USER_DEFINED">As defined: </option>
                  <option value="NULL">NULL</option>
                  <option value="CURRENT_TIMESTAMP">CURRENT_TIMESTAMP</option>
                </select>
              </div>
              <div class="field">
                <label>Default value</label>
                <input type="text" name="default_value" />
              </div>
              <div class="field">
                <label>Attributes</label>
                <select name="attributes">
                  <option value="" selected></option>
                  <option value="BINARY">BINARY</option>
                  <option value="UNSIGNED">UNSIGNED</option>
                  <option value="UNSIGNED ZEROFILL">UNSIGNED ZEROFILL</option>
                  <option value="on update CURRENT_TIMESTAMP">on update CURRENT_TIMESTAMP</option>
                </select>
              </div>
              <div class="field">
                <label>Index</label>
                <select name="index">
                  <option value="none_0" selected>---</option>
                  <option value="primary_0" title="Primary">PRIMARY</option>
                  <option value="unique_0" title="Unique">UNIQUE</option>
                  <option value="index_0" title="Index">INDEX</option>
                  <option value="fulltext_0" title="Fulltext">FULLTEXT</option>
                  <option value="spatial_0" title="Spatial">SPATIAL</option>
                </select>
              </div>
              <div class="field">
                <label>Index Name</label>
                <input type="text" name="index_name" />
              </div>
              <div class="field">
                <label>Auto Increment</label>
                <input type="checkbox" name="ai" />
              </div>
              <div class="field">
                <label>Null</label>
                <input type="checkbox" name="null" />
              </div>
              <div class="field">
              <label>Foreign Key</label>
                <input type="checkbox" name="fk" />
              </div>
              <div class="field">
                <label>Ref. Table</label>
                <select name="ref_column">
                  <option value="" selected></option>
                  ${
                    DbDesign.schema.tables.filter(each => each.id != id).map(tableData => {
                      return `
                        <optgroup label="${tableData.name}">
                          ${tableData.columns.map(column => `<option value="${tableData.id},${column.id}">${column.name}</option>`).join('')}
                        </optgroup>
                      `;
                    }).join('')
                  }
                </select>
              </div>
              <div class="field field-buttons">
                <span class="link">Cancel</span>
                <div>
                  ${button_text.toLowerCase() === 'update' ? '<input type="button" class="delete" value="Delete" />' : ''}
                  <input type="button" class="${button_text.toLowerCase()}" value="${button_text}" />
                </div>
              </div>
            </form>
          </td>
        </tr>
      `;
    }
    static renderHtml(data) {
      const $el = $('.canvas-container').find(`table[data-id="${data.id}"]`);
      const html = Table.generateHtml(data);
      if ($el.length) {
        $el.html(html);
      } else {
        $('.canvas-container').append(`
          <table data-id="${data.id}" class="entity-table ui-draggable" style="left: ${data.position.left}px; top: ${data.position.top}px;">
            ${html}
          </table>
        `);
        $('.canvas-container').find(`table[data-id="${data.id}"]`).css('z-index', Table.getHighestZIndex() + 1).draggable({
          handle: 'tr.caption',
          scroll: false,
          opacity: .8,
          stop: function(event, _ui) {
            const $el = $(event.target);
            const id = $el.data('id');
            const data = DbDesign.schema.tables.find(each => each.id === id);
            if (data) {
              const cssValue = $el.css(['left', 'top']);
              data.position.left = parseInt(cssValue.left);
              data.position.top = parseInt(cssValue.top);
            }

            Table.drawLines();
          }
        });
      }
      $(`table[data-id="${data.id}"] tbody`).sortable({
        update: function(_event, _ui) {
          const tid = $(event.target).closest('table').data('id');
          const tidx = DbDesign.schema.tables.findIndex(each => each.id === tid);
          if (tidx) {
            $(`table[data-id="${tid}"] tbody tr[data-id]`).each(function(index, el) {
              const fid = $(el).data('id');
              const fidx = DbDesign.schema.tables[tidx].columns.findIndex(each => each.id === fid);
              if (fidx) {
                DbDesign.schema.tables[tidx].columns[fidx].position = index + 1;
              }
            });
          }

          Table.renderHtml(DbDesign.schema.tables[tidx]);
          Table.drawLines();
        }
      });
      $('.canvas-container').find('[name="name"]').trigger('input');
    }
    static drawLines() {
      DbDesign.initCanvas(function() {
        const canvas = window.document.getElementById('graph');
        const context = canvas.getContext('2d');
        if (DbDesign.schema != null) {
          context.font = '20px Arial, sans-serif';
          context.fillStyle = '#888';
          context.fillText(DbDesign.schema.name, 30, 40);

          DbDesign.schema.tables.forEach(table => {
            table.columns.forEach(column => {
              if (column.ref_column.length != 0) {
                Table.drawLine(
                  ...Table.calcPointstoDrawLine(table.id, column.id, ...column.ref_column.split(','))
                );
              }
            });
          });
        }
      });
    }
    static calcPointstoDrawLine(source_table, source_column, dest_table, dest_column) {
      const $source_table = $(`table[data-id="${source_table}"]`);
      const $source_column = $source_table.find(`[data-id="${source_column}"]`);
      const $dest_table = $(`table[data-id="${dest_table}"]`);
      const $dest_column = $dest_table.find(`[data-id="${dest_column}"]`);

      const source = {
        left: {
          left: parseInt($source_table.css('left')),
          top: parseInt($source_table.css('top'))
          + $source_table.find('thead').outerHeight()
          + ($source_column.outerHeight() / 2)
          + $source_column.prevAll().toArray().filter(each => $(each).css('display') != 'none').reduce((preVal, curVal) => preVal + $(curVal).outerHeight(), 0)
        },
        right: {
          left: parseInt($source_table.css('left')) + $source_table.outerWidth(),
          top: parseInt($source_table.css('top'))
          + $source_table.find('thead').outerHeight()
          + ($source_column.outerHeight() / 2)
          + $source_column.prevAll().toArray().filter(each => $(each).css('display') != 'none').reduce((preVal, curVal) => preVal + $(curVal).outerHeight(), 0)
        }
      };
      const dest = {
        left: {
          left: parseInt($dest_table.css('left')),
          top: parseInt($dest_table.css('top'))
          + $dest_table.find('thead').outerHeight()
          + ($dest_column.outerHeight() / 2)
          + $dest_column.prevAll().toArray().filter(each => $(each).css('display') != 'none').reduce((preVal, curVal) => preVal + $(curVal).outerHeight(), 0)
        },
        right: {
          left: parseInt($dest_table.css('left')) + $dest_table.outerWidth(),
          top: parseInt($dest_table.css('top'))
          + $dest_table.find('thead').outerHeight()
          + ($dest_column.outerHeight() / 2)
          + $dest_column.prevAll().toArray().filter(each => $(each).css('display') != 'none').reduce((preVal, curVal) => preVal + $(curVal).outerHeight(), 0)
        }
      };

      const buffer = 100;
      const gap = 5;
      let output = null;

      if (buffer < dest.left.left - source.left.left &&  buffer < dest.left.left - source.right.left) {
        output = [source.right.left + gap, source.right.top, dest.left.left - gap, dest.left.top, 'right'];
      } else if (buffer < source.left.left - dest.left.left && buffer < source.left.left - dest.right.left) {
        output = [source.left.left - gap, source.left.top, dest.right.left + gap, dest.right.top, 'left'];
      } else {
        output = [source.left.left - gap, source.left.top, dest.left.left - gap, dest.left.top, 'special'];
      }

      output.push(DbDesign.schema.tables.find(table => table.id === dest_table).color);
      return output;
    }
    static drawLine(left1, top1, left4, top4, type, color) {
      let left2, top2 = top1, left3, top3 = top4;
      left2 = left3 = Math.min(left1, left4) + (Math.abs(left1 - left4) / 2) - (type === 'special' ? 50 + (Math.abs(left1 - left4) / 1.75) : 0);
      const canvas = window.document.getElementById('graph');
      const context = canvas.getContext('2d');
      context.fillStyle = context.strokeStyle = color;

      context.beginPath();
      context.moveTo(left1, top1);
      if (DbDesign.getCurrentLineType() === 'bezier') {
        context.bezierCurveTo(left2, top2, left3, top3, left4, top4);
      } else {
        context.lineTo(left2, top2);
        context.lineTo(left3, top3);
        context.lineTo(left4, top4);
      }
      context.stroke();

      context.beginPath();
      context.moveTo(left4, top4);
      if (type === 'right' || type === 'special') {
        context.lineTo(left4 - 10, top4 - 5);
        context.lineTo(left4 - 10, top4 + 5);
      } else {
        context.lineTo(left4 + 10, top4 - 5);
        context.lineTo(left4 + 10, top4 + 5);
      }
      context.fill();
    }
    static fieldConditionRender(event) {

      // hide fields based on rules
      const $table = $(event.target).closest('table');

      const fun = function($form) {


        if ($form.find('select[name="default"]').val() === 'USER_DEFINED') {
          $form.find('[name="default_value"]').parent().removeClass('hide');
        } else {
          $form.find('[name="default_value"]').parent().addClass('hide');
          $form.find('[name="default_value"]').val('');
        }


        if ($form.find('select[name="index"]').val() === 'none_0') {
          $form.find('[name="index_name"]').parent().addClass('hide');
          $form.find('[name="index_name"]').val('').attr('disabled', false);
        } else {
          $form.find('[name="index_name"]').parent().removeClass('hide');
          if ($form.find('select[name="index"]').val() === 'primary_0') {
            $form.find('[name="index_name"]').val('PRIMARY').attr('disabled', true);
          } else {
            $form.find('[name="index_name"]').val('').attr('disabled', false);
          }
        }

        if ($form.find('[name="fk"]').prop('checked') === true) {
          $form.find('[name="ref_table"]').parent().removeClass('hide');
          $form.find('[name="ref_column"]').parent().removeClass('hide');
        } else {
          $form.find('[name="ref_table"]').parent().addClass('hide');
          $form.find('[name="ref_column"]').parent().addClass('hide');
        }
      };

      $table.find('form').each(function(_idx, each) {
        fun($(each));
      });
    }
    static getHighestZIndex() {
      return $('table[data-id]').toArray().reduce((preVal, curVal) => {
        const currentZindex = window.Number($(curVal).css('z-index'));
        if (preVal < currentZindex) {
          preVal = currentZindex;
        }
        return preVal;
      }, 0);
    }
    static events() {
      return {
        editTable: function() {
          const $this = $(this);
          const tid = $this.closest('table').data('id');
          const tidx = DbDesign.schema.tables.findIndex(each => each.id === tid);
          if (tid === -1) {
            return;
          }

          $this.closest('tr').removeClass('show').next().addClass('show').find('[name="name"]').val(DbDesign.schema.tables[tidx].name).trigger('focus').closest('table').css('z-index', Table.getHighestZIndex() + 1);
        },
        saveTable: function() {
          const $this = $(this);
          const tid = $this.closest('table').data('id');
          const $form = $this.closest('form');
          const data = $form.serializeObject();
          const tidx = DbDesign.schema.tables.findIndex(each => each.id === tid);
          if (tid === -1) {
            return;
          }

          DbDesign.schema.tables[tidx].name = data.name;
          Table.renderHtml(DbDesign.schema.tables[tidx]);
        },
        fieldChanage: function(event) {
          const $this = $(this);
          if ($this.attr('name') === 'default') {
            if ($this.val() === 'NULL' && $this.closest('form').find('[name="null"]').prop('checked') === false) {
              $this.closest('form').find('[name="null"]').prop('checked', true);
            }
          }
          if ($this.attr('name') === 'null') {
            if ($this.prop('checked') === false && $this.closest('form').find('[name="default"]').val() === 'NULL') {
              $this.closest('form').find('[name="default"]').val('NONE');
            }
          }
          Table.fieldConditionRender(event)
        },
        addField: function(event) {
          const $this = $(event.target);
          $this.closest('tr').removeClass('show').next().addClass('show').find('[name="name"]').trigger('focus').closest('table').css('z-index', Table.getHighestZIndex() + 1);
          Table.fieldConditionRender(event);
        },
        cancelAddField: function(event) {
          const $this = $(event.target);
          $this.closest('tr').removeClass('show').prev().addClass('show');
        },
        saveAddUpdateField: function(event) {
          const $this = $(event.target);
          const tid = $this.closest('table').data('id');
          const fid = $this.closest('tr').prev().data('id');
          const $form = $this.closest('form');
          const data = $form.serializeObject();
          const tidx = DbDesign.schema.tables.findIndex(each => each.id === tid);
          if (tid === -1) {
            return;
          }

          if (fid === undefined) {
            data.id = DbDesign.uuid();

            data.position = DbDesign.schema.tables[tidx].columns.length + 1;
            DbDesign.schema.tables[tidx].columns.push(data);
            Table.renderHtml(DbDesign.schema.tables[tidx]);
            Table.drawLines();

            // $form.trigger('reset');
            // $this.closest('tr').removeClass('show').prev().addClass('show');
          } else {
            data.id = fid;
            const fidx = DbDesign.schema.tables[tidx].columns.findIndex(each => each.id === fid);
            if (fidx != undefined) {
              DbDesign.schema.tables[tidx].columns[fidx] = data;
              Table.renderHtml(DbDesign.schema.tables[tidx]);
              Table.drawLines();

              // $form.trigger('reset');
              // $this.closest('tr').removeClass('show').prev().addClass('show');
            }
          }
        },
        deleteField: function() {
          const $this = $(this);
          const tid = $this.closest('table').data('id');
          const fid = $this.closest('tr').prev().data('id');
          $this.closest('tr').prev().remove();
          $this.closest('tr').remove();

          const tidx = DbDesign.schema.tables.findIndex(each => each.id === tid);
          if (tidx != -1) {
            const fidx = DbDesign.schema.tables[tidx].columns.findIndex(each => each.id === fid);
            if (fidx) {
              DbDesign.schema.tables[tidx].columns.splice(fidx, 1);
              Table.renderHtml(DbDesign.schema.tables[tidx]);
              Table.drawLines();
            }
          }
        },
        editField: function(event) {
          const $this = $(event.target);
          const tid = $this.closest('table').css('z-index', Table.getHighestZIndex() + 1).data('id');
          const fid = $this.closest('tr').data('id');

          $this.closest('tr').removeClass('show').next().addClass('show').find('[name="name"]').trigger('focus');
          const fData = DbDesign.schema.tables.find(each => each.id === tid).columns.find(each => each.id === fid);
          const $form = $this.closest('tr').next().find('form');
          Object.entries(fData).forEach(([key, value]) => {
            if (['name', 'type', 'size', 'default', 'default_value', 'attributes', 'index', 'index_name', 'ref_column'].includes(key)) {
              $form.find(`[name="${key}"]`).val(value);
            } else if(['ai', 'null', 'fk'].includes(key)) {
              $form.find(`[name="${key}"]`).prop('checked', value);
            }
          });

          Table.fieldConditionRender(event);
        }
      };
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
      DbDesign.schema.updated_at = new Date().getTime();
      await store.put(DbDesign.schema);
      await tx.done;

      $.notify('Schema saved', {
        globalPosition: 'top center',
        className: 'success'
      });
    }
    static async deleteSchema() {

      const tx = window.idb.dbdesign.transaction(['schemas'], 'readwrite');
      const store = tx.objectStore('schemas');
      await store.delete(DbDesign.schema.id);
      await tx.done;

      DbDesign.initCanvas(function() {
        DbDesign.schema = null;
        $('table[data-id]').remove();
        $('ul.context-menu').removeClass('show');
      });
    }
    static async loadSchema(left, top, height, action) {
      const schemas = await DbDesign.getAllSchemas();
      $('ul.context-menu.sub').data('action', action).html(
        schemas.map(each => {
          return `
            <li class="menu-item" data-id="${each.id}">${each.name}</li>
          `;
        }).join('')
      );

      // check can right possible if not then move it to left
      const bufferSpace = 25;
      if (left + $('ul.context-menu.sub').outerWidth() + bufferSpace > window.innerWidth) {
        left -= $('ul.context-menu.main').outerWidth() + $('ul.context-menu.sub').outerWidth();
      }

      // check div won't exceed for top value
      if (top + $('ul.context-menu.sub').outerHeight() + bufferSpace > window.innerHeight) {
        top -= $('ul.context-menu.sub').outerHeight();
        top += height + 1;
      }

      $('ul.context-menu.sub').css({
        left,
        top
      }).addClass('show');
    }
    static newTable(left, top) {
      setTimeout(async function() {
        const name = window.prompt('Please enter new table name');
        if (name) {
          const tableId = DbDesign.uuid();
          const obj = {
            id: tableId,
            name: name,
            color: '#dadada',
            position: {
              left: left,
              top: top
            },
            columns: []
          };
          DbDesign.schema.tables.push(obj);
          Table.renderHtml(obj);
          Table.drawLines();
        }
      }, 0);
    }
    static deleteTable(id) {
      const idx = DbDesign.schema.tables.findIndex(each => each.id === id);
      if (idx !== -1) {
        $(`table[data-id="${id}"]`).remove();
        DbDesign.schema.tables.splice(idx, 1);
      }
    }
    static genImage() {
      const graphCanvas = window.document.getElementById('graph');
      const imgCanvas = window.document.createElement('canvas');

      const newImage = new Image();
      newImage.addEventListener('load', async (event) => {
        const maxPoint = DbDesign.schema.tables.reduce((preVal, curVal) => {
          const $el = $(`table[data-id="${curVal.id}"]`);

          const curPoint = {
            x: curVal.position.left + $el.width(),
            y: curVal.position.top + $el.height()
          };
          if (preVal.x < curPoint.x) {
            preVal.x = Math.ceil(curPoint.x / event.target.width) * event.target.width;
            preVal.x += 1;
          }
          if (preVal.y < curPoint.y) {
            preVal.y = Math.ceil(curPoint.y / event.target.height) * event.target.height;
            preVal.y += 1;
          }

          return preVal;
        }, {
          x: 0,
          y: 0
        });
        if (maxPoint.x + maxPoint.y == 0) {
          $.notify('schema is empty', {
            globalPosition: 'top center',
            className: 'error'
          });
          return;
        }

        imgCanvas.width = maxPoint.x;
        imgCanvas.height = maxPoint.y;
        const imgContext = imgCanvas.getContext('2d');
        imgContext.fillStyle = '#fff';
        imgContext.fillRect(0, 0, imgCanvas.width, imgCanvas.height);
        imgContext.drawImage(graphCanvas, 0, 0, graphCanvas.width, graphCanvas.height);

        DbDesign.schema.tables.forEach(table => {
          const $el = $(`table[data-id="${table.id}"]`);

          imgContext.beginPath();
          imgContext.strokeStyle = '#000';
          imgContext.fillStyle = '#fff';
          imgContext.shadowBlur = 5;
          imgContext.shadowOffsetX = 2;
          imgContext.shadowOffsetY = 2;
          imgContext.shadowColor = 'rgba(136, 136, 136, 0.5)';
          const tableRect = {
            x: parseInt(table.position.left) + 0.5,
            y: parseInt(table.position.top) + 0.5,
            width: parseInt($el.outerWidth()),
            height: parseInt($el.outerHeight() - $el.find('tfoot').outerHeight())
          };
          imgContext.rect(tableRect.x, tableRect.y, tableRect.width, tableRect.height);
          imgContext.fillRect(tableRect.x, tableRect.y, tableRect.width, tableRect.height);
          imgContext.stroke();

          imgContext.beginPath();
          imgContext.strokeStyle = table.color;
          imgContext.fillStyle = table.color;
          const headRect = {
            x: tableRect.x + 1,
            y: tableRect.y + 1,
            width: parseInt($el.outerWidth()) - 2,
            height: parseInt($el.find('thead').outerHeight())
          };
          imgContext.rect(headRect.x, headRect.y, headRect.width, headRect.height);
          imgContext.fillRect(headRect.x, headRect.y, headRect.width, headRect.height);
          imgContext.stroke();
          headRect.height += 1;

          imgContext.beginPath();
          imgContext.strokeStyle = '#000';
          imgContext.moveTo(tableRect.x, tableRect.y + headRect.height);
          imgContext.lineTo(tableRect.x + tableRect.width, tableRect.y + headRect.height);
          imgContext.stroke();

          imgContext.font = 'bold 13px Arial, sans-serif';
          imgContext.fillStyle = table.color === '#dadada' ? '#000' : '#fff';
          imgContext.fillText(table.name, tableRect.x + 2.5, tableRect.y + 15);

          table.columns.forEach((column, index, array) => {
            const $column = $el.find(`[data-id=${column.id}]`);

            if (index + 1 != array.length) {
              imgContext.beginPath();
              imgContext.strokeStyle = '#000';
              imgContext.moveTo(
                tableRect.x,
                tableRect.y + headRect.height + ($column.outerHeight() * (index + 1))
              );
              imgContext.lineTo(
                tableRect.x + tableRect.width,
                tableRect.y + headRect.height + ($column.outerHeight() * (index + 1))
              );
              imgContext.stroke();
            }

            $column.find('td.img img').toArray().forEach((img, index1) => {
              imgContext.drawImage(
                img,
                parseInt(tableRect.x + (20 * index1) + 5),
                parseInt(tableRect.y + headRect.height + ($column.outerHeight() * index) + 4),
                16,
                16
              );
            });

            imgContext.font = '400 12px Arial, sans-serif';
            imgContext.fillStyle = '#000';
            imgContext.fillText(
              column.name,
              tableRect.x + 60,
              tableRect.y + headRect.height + ($column.outerHeight() * index) + 15
            );

            imgContext.font = '400 12px Arial, sans-serif';
            imgContext.fillStyle = '#000';
            imgContext.fillText(
              `${column.type}${column.size.length ? `(${column.size})` : ''}`,
              tableRect.x + 125,
              tableRect.y + headRect.height + ($column.outerHeight() * index) + 15
            );
          });
        });

        const img = new Image();
        img.src = imgCanvas.toDataURL('image/png');
        const win = window.open('');
        win.document.write(img.outerHTML);
      });
      newImage.src = 'https://raw.githubusercontent.com/sai5171/db-design/main/docs/graph.png';
    }
  };

  const DbDesign = class {
    static schema = null;

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

      DbDesign.schema = obj;
      DbDesign.initCanvas(function() {
        const canvas = window.document.getElementById('graph');
        const context = canvas.getContext('2d');
        context.font = '20px Arial, sans-serif';
        context.fillStyle = '#888';
        context.fillText(obj.name, 30, 40);
        $('table[data-id]').remove();
        DbDesign.schema.tables.forEach(table => {
          Table.renderHtml(table);
        });
        Table.drawLines();
      });
    }
    static async getAllSchemas() {
      const tx = window.idb.dbdesign.transaction(['schemas'], 'readonly');
      const store = tx.objectStore('schemas');
      const allSchemas = await store.getAll();
      await tx.done;
      return allSchemas;
    }
    static async getAllSchemaKeys() {
      const tx = window.idb.dbdesign.transaction(['schemas'], 'readonly');
      const store = tx.objectStore('schemas');
      const allSchemas = await store.getAllKeys();
      await tx.done;
      return allSchemas;
    }
    static initCanvas(cbk) {
      const canvas = window.document.getElementById('graph');
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);

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
        cbk();
      });
      newImage.src = 'https://raw.githubusercontent.com/sai5171/db-design/main/docs/graph.png';
    }
    static initEvents() {
      const windowEvent = {
        resizeHandler: function() {
          $('.canvas-container').css({
            'width': `${window.innerWidth}px`,
            'height': `${window.innerHeight}px`
          })
        }
      };
      const windowDocument = {
        contextmenuHandler: async function(event) {
          const $el = $(event.target);
          const isTable = $el.hasClass('.entity-table') || $el.parents('.entity-table').length;
          let tableId = null;
          if (isTable) {
            tableId = $el.data('id') || $el.parents('.entity-table').data('id');
          }
          const isCurrentSchemaPresent = DbDesign.schema !== null;

          if ($('ul.context-menu.sub').hasClass('show')) {
            $('ul.context-menu.sub').removeClass('show');
          }
          $('ul.context-menu.main').html(`
            ${isTable ? `<li class="menu-item" data-value="delete_table">Delete Table</li>` : ''}
            ${!isTable && isCurrentSchemaPresent ? `
              <li class="menu-item" data-value="new_table">New Table</li>
              <li class="menu-item" data-value="save_schema">Save Schema</li>
              <li class="menu-item" data-value="delete_schema">Delete Schema</li>
              ` : ''}
            ${!isTable ? '<li class="menu-item" data-value="new_schema">New Schema</li>' : ''}
            ${!isTable && (await DbDesign.getAllSchemaKeys()).length !== 0 ? '<li class="menu-item" data-value="load_schema">Load Schema</li>' : ''}
            ${!isTable ? '<li class="menu-item" data-value="import_schema">Import Schema</li>' : ''}
            ${!isTable && (await DbDesign.getAllSchemaKeys()).length !== 0 ? '<li class="menu-item" data-value="export_schema">Export Schema</li>' : ''}
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
            		<span title="reset" class="table-color table-color-reset" data-color="#dadada"></span>
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
              <label><input type="radio" name="line_type" value="bezier" ${DbDesign.getCurrentLineType() === 'bezier' ? 'checked' : ''} /><span>Bezier</span></label>
              <label><input type="radio" name="line_type" value="corners" ${DbDesign.getCurrentLineType() === 'corners' ? 'checked' : ''} /><span>Corners</span></label>
              <span>&nbsp;</span>
            </li>
          `);

          const contextMenuDimensions = {
            width: $('ul.context-menu.main').outerWidth(),
            heigth: $('ul.context-menu.main').outerHeight()
          };
          const bufferSpace = 25;
          const contextMenupoint = {
            left: (event.pageX + contextMenuDimensions.width + bufferSpace) < window.innerWidth ? event.pageX : event.pageX - contextMenuDimensions.width,
            top: (event.pageY + contextMenuDimensions.heigth + bufferSpace) < window.innerHeight ? event.pageY : event.pageY - contextMenuDimensions.heigth
          };
          contextMenupoint.left += $('.canvas-container').scrollLeft();
          contextMenupoint.top += $('.canvas-container').scrollTop();
          $('ul.context-menu.main').css(contextMenupoint).data({
            left: contextMenupoint.left,
            top: contextMenupoint.top,
            id: tableId
          }).addClass('show');
        },
        clickHandler: function(event) {
          const $el = $(event.target);
          if (!($el.hasClass('context-menu') || $el.parents('ul.context-menu').length === 1)) {
            $('ul.context-menu').removeClass('show');
          }
        },
        keyHandler: function() {
          let keyMap = {};
          return function(event) {
            if (event.repeat) return;
            keyMap[event.key] = event.type === 'keydown';
            if (keyMap['Escape'] === true) {
              keyMap = {};
              if ($('ul.context-menu').hasClass('show')) {
                $('ul.context-menu').removeClass('show');
              }
            } else if (keyMap['Shift'] === true && (keyMap['s'] === true || keyMap['S'] === true)) {
              keyMap = {};
              if (DbDesign.schema != null) {
                Controller.saveSchema();
              }
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
          if (event.target.id === 'graph') {
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
        clickHandler: function(_event) {

          const $this = $(this);
          const $ul = $this.parent();
          const value = $this.data('value');
          if (['new_table', 'delete_table', 'new_schema', 'save_schema', 'full_screen', 'gen_image'].includes(value)) {
            $('ul.context-menu').removeClass('show');
          }
          if (value === 'new_table') {
            Controller.newTable($ul.data('left'), $ul.data('top'));
          } else if (value === 'delete_table') {
            Controller.deleteTable($ul.data('id'));
          } else if (value === 'new_schema') {
            Controller.newSchema();
          } else if (value === 'save_schema') {
            Controller.saveSchema();
          } else if (value === 'load_schema') {
            Controller.loadSchema(
              $ul.data('left') + $ul.outerWidth(),
              $ul.data('top') + $this.prevAll().toArray().reduce((preVal, curVal) => preVal + $(curVal).outerHeight(), parseInt($ul.css('border-top-width'))),
              $this.outerHeight(),
              value
            );
          } else if (value === 'delete_schema') {
            Controller.deleteSchema();
          } else if (value === 'full_screen') {
            Controller.fullScreen();
          } else if (value === 'gen_image') {
            Controller.genImage();
          } else if (value === 'export_schema') {
            Controller.loadSchema(
              $ul.data('left') + $ul.outerWidth(),
              $ul.data('top') + $this.prevAll().toArray().reduce((preVal, curVal) => preVal + $(curVal).outerHeight(), parseInt($ul.css('border-top-width'))),
              $this.outerHeight(),
              value
            );
          }
        },
        lineTypeHandler: function() {
          window.localStorage.line_type = $(this).val();
          $('ul.context-menu').removeClass('show');
          Table.drawLines();
        },
        colorChangeHandler: function(event) {
          const $el = $(event.target);
          const id = $el.parents('ul').data('id');
          const color = $el.data('color');
          $(`table[data-id="${id}"]`)
            .find('tr.caption')[color === '#dadada' ? 'removeClass' : 'addClass']('colored')
            .css('background-color', color);
          const idx = DbDesign.schema.tables.findIndex(each => each.id === id);
          if (idx !== -1) {
            DbDesign.schema.tables[idx].color = color;
            Table.drawLines();
          }
          $('ul.context-menu.main').removeClass('show');
        }
      };
      const contextMenuSub = {
        clickHandler: async function() {
          const $el = $(this);
          const id = $el.data('id');
          const action = $el.parent().data('action');
          if (action == 'load_schema') {
            DbDesign.loadSchema(id);
            $('ul.context-menu').removeClass('show');
          } else if (action == 'export_schema') {
            const tx = window.idb.dbdesign.transaction(['schemas'], 'readonly');
            const store = tx.objectStore('schemas');
            const obj = await store.get(id);
            await tx.done;

            let file = new Blob([JSON.stringify(obj, null, 2)], {
              type: 'application/json'
            });
            const a = document.createElement('a'),
              url = URL.createObjectURL(file);
            a.href = url;
            a.download = `${obj.name}-${obj.id}.json`;
            window.document.body.appendChild(a);
            a.click();
            setTimeout(function() {
              window.document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }, 0);
          }
        }
      }
      window.addEventListener('resize', windowEvent.resizeHandler);
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
      })
      .on('click', 'table thead th.table-ops img', Table.events().editTable)
      .on('click', 'table .table-save', Table.events().saveTable)
      .on('input', 'table input', Table.events().fieldChanage)
      .on('change', 'table select', Table.events().fieldChanage)
      .on('click', 'tr.add-field-button span', Table.events().addField)
      .on('click', '.field-buttons span.link', Table.events().cancelAddField)
      .on('click', '.field-buttons input[type="button"].save', Table.events().saveAddUpdateField)
      .on('click', '.field-buttons input[type="button"].update', Table.events().saveAddUpdateField)
      .on('click', '.field-buttons input[type="button"].delete', Table.events().deleteField)
      .on('click', 'img.edit-field', Table.events().editField);
      $('ul.context-menu.main').on({
        click: contextMenu.clickHandler
      }, 'li');
      $('ul.context-menu.main').on('change', 'input[type="radio"]', contextMenu.lineTypeHandler);
      $('ul.context-menu.main').on('click', '.table-color', contextMenu.colorChangeHandler);
      $('ul.context-menu.sub').on({
        click: contextMenuSub.clickHandler
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
    static protos() {
      /**
       * @prototype
       * @desc custom async for each function.
       * @param {Function} cbk callback function for async forEach.
       */
      Object.defineProperty(Array.prototype, 'asyncforEach', {
        value: async function(cbk) {
          for (let i = 0; i < this.length; i++) await cbk(this[i], i, this);
        }
      });

      /**
       * @desc form serializeObject.
       * {@link https://stackoverflow.com/questions/17488660/difference-between-serialize-and-serializeobject-jquery}.
       * @param {Array} names - A array or string contaning required names.
       * @returns {Object} form object.
       */
      $.fn.serializeObject = function(names = []) {
        const a = this.serializeArray();

        // checkbox if checked serializeArray will give value as 'on' if not checked it wont give entry
        $(this).find('input[type=checkbox]').get().forEach(function(e) {
          const index = a.findIndex(each => each.name === e.name);
          if (index === -1) {
            a.push({
              name: e.name,
              value: e.checked
            });
          } else {
            a[index].value = e.checked;
          }
        });

        // return object
        const obj = {};
        a.forEach(function(e) {
          if (!names.length || names.includes(e.name)) {

            // check if e.value type is boolean
            if (typeof e.value === 'boolean') {
              obj[e.name] = e.value;
              return;
            }

            // check if e.value is convertible to number
            if (obj.hasOwnProperty(e.name)) {
              if (!(obj[e.name] instanceof Array)) obj[e.name] = [obj[e.name]];
              obj[e.name].push(e.value);
            } else {
              obj[e.name] = e.value;
            }
          }
        });

        return obj;
      };
    }
    static async init() {
      DbDesign.initEvents();
      DbDesign.protos();
      await DbDesign.initIdb();

      const schemas = await DbDesign.getAllSchemas();

      window.dispatchEvent(new Event('resize'));
      const latestSchema = schemas.sort((a, b) => a.updated_at < b.updated_at ? 1 : -1)[0];
      if (latestSchema !== undefined) {
        await DbDesign.loadSchema(latestSchema.id);
        $('body').addClass('show');
      } else {
        DbDesign.initCanvas(function() {
          $('body').addClass('show');
        });
      }
    }
  };

  // on dom ready
  $(function() {
    DbDesign.init();
  });
})();
