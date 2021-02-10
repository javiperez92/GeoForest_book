var sch = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry({
      "type": "GeometryCollection",
      "geometries": [
        {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.48137772310656146,
                39.77378318679593
              ],
              [
                -0.49236405123156146,
                39.794889529299425
              ],
              [
                -0.5184565805284365,
                39.8033302534149
              ],
              [
                -0.5321894906846865,
                39.779060379383324
              ],
              [
                -0.5157099984971865,
                39.766394437418214
              ],
              [
                -0.5294429086534365,
                39.70408632909143
              ],
              [
                -0.5280696176378115,
                39.68929308672391
              ],
              [
                -0.5019770883409365,
                39.67661064125064
              ],
              [
                -0.5074702524034365,
                39.66392586664878
              ],
              [
                -0.46489823091906146,
                39.64912401944591
              ],
              [
                -0.45116532076281146,
                39.66604015748592
              ],
              [
                -0.42369950045031146,
                39.67449667389014
              ],
              [
                -0.40035355318468646,
                39.66392586664878
              ],
              [
                -0.38112747896593646,
                39.65969709089758
              ],
              [
                -0.34954178560656146,
                39.69140660117948
              ],
              [
                -0.36602127779406146,
                39.71148176125452
              ],
              [
                -0.41271317232531146,
                39.72627024734803
              ],
              [
                -0.43605911959093646,
                39.74422343135387
              ]
            ]
          ],
          "evenOdd": true
        },
        {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.5315885585207525,
                39.741269975078524
              ],
              [
                -0.4711637538332525,
                39.763441931646874
              ],
              [
                -0.4382047694582525,
                39.76977546555002
              ],
              [
                -0.4148588221926275,
                39.801434395065336
              ],
              [
                -0.4189786952395025,
                39.82780570748005
              ],
              [
                -0.4642972987551275,
                39.8457324200794
              ],
              [
                -0.5521879237551275,
                39.81303901907389
              ]
            ]
          ],
          "geodesic": true,
          "evenOdd": true
        }
      ],
      "coordinates": []
    }),
    sch2 = 
    /* color: #ffc82d */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-0.5358624356072141, 39.81631908863327],
          [-0.5379223721306516, 39.80919864133964],
          [-0.5379223721306516, 39.8033962500483],
          [-0.5430722134392454, 39.79785714701586],
          [-0.5410122769158079, 39.79073478753645],
          [-0.5341458218376829, 39.78255635421349],
          [-0.5197262661736204, 39.781237161019064],
          [-0.5162930386345579, 39.7836116905602],
          [-0.5118298428337766, 39.78783287408843],
          [-0.5056500332634641, 39.784930838232356],
          [-0.4860806362908079, 39.78413935266389],
          [-0.4689144985954954, 39.78598613816098],
          [-0.4373288052361204, 39.781237161019064],
          [-0.43080567291190164, 39.79469174496506],
          [-0.4277157681267454, 39.811044754056205],
          [-0.44934510162283914, 39.81579167338815],
          [-0.46719788482596414, 39.812363375643045],
          [-0.4750943081658079, 39.812363375643045],
          [-0.4847073452751829, 39.82159301848185],
          [-0.5008435147087766, 39.82132933160194],
          [-0.5125164883415891, 39.82132933160194],
          [-0.5348324673454954, 39.82291143770356]]]);

var Comunidad = ee.FeatureCollection('ft:1oqdcvye4mQD4NJ9kRWNEIYcmAgJT2Q_mdij0PtX6');

//Landsat8 colection
var col1 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR').filterBounds(sch)
.filterDate('2017-06-01','2017-06-30');
var col2 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR').filterBounds(sch)
.filterDate('2017-07-01','2017-07-31');
print(col1,col2)

//Month
var juny = col1.mosaic().clip(Comunidad)
var july = col2.mosaic().clip(Comunidad)
print(juny,july)
//NBR
var nbr1 = juny.normalizedDifference(['B5','B7']).rename('NBR');
var nbr2 = july.normalizedDifference(['B5','B7']).rename('NBR');
print(nbr1,nbr2)

//diference
var dnbr = nbr1.subtract(nbr2)
var color = {min: -0.3, max: 1.0, palette:['0000ff', '00ffff', 'ffff00', 'ff0000', 'ffffff'],};
//Mapa
Map.addLayer(dnbr, color, 'NBR')

//mascara
var mask = dnbr.updateMask(dnbr.gte(0.10));
print(mask)
Map.addLayer(mask, color, 'NBR_mask')

//hacer banda con numero integro
var banda = mask.expression(
    'N/N', {
      'N': mask.select('NBR')
});
banda = banda.toInt()
print(banda,'index')

// Convert the zones to vectors.

var vectors = banda.reduceToVectors({
  geometry: sch2,
  crs: mask.projection(),
  scale: 30,
  geometryType: 'polygon',
  eightConnected: false,
  labelProperty: 'zone',
  maxPixels: 5000000000
});
print(vectors)


var display = ee.Image(0).updateMask(0).paint(vectors, '000000', 3);
Map.addLayer(display, {palette: '000000'}, 'Burned_Area');
Map.centerObject(sch2)
