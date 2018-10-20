/*
TestLSM9DS1_d.js
30 Nov 2016
*/
/////////////////////////////////////////
var Regs={
 ACT_THS:0x04,
 ACT_DUR:0x05,
  INT_GEN_CFG_XL:	(0x06),
  INT_GEN_THS_X_XL:	(0x07),
  INT_GEN_THS_Y_XL:	(0x08),
  INT_GEN_THS_Z_XL:	(0x09),
  INT_GEN_DUR_XL:	(0x0A),
  REFERENCE_G:		(0x0B),
  INT1_CTRL:		(0x0C),
  INT2_CTRL:		(0x0D),
  WHO_AM_I_XG:		(0x0F),
  CTRL_REG1_G:		(0x10),
  CTRL_REG2_G:		(0x11),
  CTRL_REG3_G:		(0x12),
  ORIENT_CFG_G:		(0x13),
  INT_GEN_SRC_G:	(0x14),
  OUT_TEMP_L:		(0x15),
  OUT_TEMP_H:		(0x16),
  STATUS_REG_0:		(0x17),
  OUT_X_L_G:		(0x18),
  OUT_X_H_G:		(0x19),
  OUT_Y_L_G:		(0x1A),
  OUT_Y_H_G:		(0x1B),
  OUT_Z_L_G:		(0x1C),
  OUT_Z_H_G:		(0x1D),
  CTRL_REG4:		(0x1E),
  CTRL_REG5_XL:		(0x1F),
  CTRL_REG6_XL:		(0x20),
  CTRL_REG7_XL:		(0x21),
  CTRL_REG8:		(0x22),
  CTRL_REG9:		(0x23),
  CTRL_REG10:		(0x24),
  INT_GEN_SRC_XL:	(0x26),
  STATUS_REG_1:		(0x27),
  OUT_X_L_XL:		(0x28),
  OUT_X_H_XL:		(0x29),
  OUT_Y_L_XL:		(0x2A),
  OUT_Y_H_XL:		(0x2B),
  OUT_Z_L_XL:		(0x2C),
  OUT_Z_H_XL:		(0x2D),
  FIFO_CTRL:		(0x2E),
  FIFO_SRC: 		(0x2F),
  INT_GEN_CFG_G:	(0x30),
  INT_GEN_THS_XH_G:	(0x31),
  INT_GEN_THS_XL_G:	(0x32),
  INT_GEN_THS_YH_G:	(0x33),
  INT_GEN_THS_YL_G:	(0x34),
  INT_GEN_THS_ZH_G:	(0x35),
  INT_GEN_THS_ZL_G:	(0x36),
  INT_GEN_DUR_G:	(0x37)
};

///////////////////////////////
// LSM9DS1 Magneto Registers //
///////////////////////////////
var Mags={
  OFFSET_X_REG_L_M:	0x05,
  OFFSET_X_REG_H_M:	0x06,
  OFFSET_Y_REG_L_M:	0x07,
  OFFSET_Y_REG_H_M:	0x08,
  OFFSET_Z_REG_L_M:	0x09,
  OFFSET_Z_REG_H_M:	0x0A,
  WHO_AM_I_M:			0x0F,
  CTRL_REG1_M:			0x20,
  CTRL_REG2_M:			0x21,
  CTRL_REG3_M:			0x22,
  CTRL_REG4_M:			0x23,
  CTRL_REG5_M:			0x24,
  STATUS_REG_M:		0x27,
  OUT_X_L_M:			0x28,
  OUT_X_H_M:			0x29,
  OUT_Y_L_M:			0x2A,
  OUT_Y_H_M:			0x2B,
  OUT_Z_L_M:			0x2C,
  OUT_Z_H_M:			0x2D,
  INT_CFG_M:			0x30,
  INT_SRC_M:			0x30,
  INT_THS_L_M:			0x32,
  INT_THS_H_M:		0x33
};
var magSensitivity = [0.00014, 0.00029, 0.00043, 0.00058];
////////////////////////////////
// LSM9DS1 WHO_AM_I Responses //
////////////////////////////////
var WHO_AM_I_AG_RSP=0x68;
var WHO_AM_I_M_RSP=0x3D;


function LSM9DS1(i2c) {
  this.i2c = i2c;
  this.gain = 2048;
  this.gBias=[];
  this.aBias=[];
  this.mBias=[];
  this.gBiasRaw=[];
  this.aBiasRaw=[];
  this.mBiasRaw=[];
}

LSM9DS1.prototype.init=function(xgAddr,mAddr){
	this.xgAddress = xgAddr;
	this.mAddress = mAddr;

	this.gyro_enabled = true;
	this.gyro_enableX = true;
	this.gyro_enableY = true;
	this.gyro_enableZ = true;
	// gyro scale can be 245, 500, or 2000
	this.gyro_scale = 245;
	// gyro sample rate: value between 1-6
	// 1 = 14.9    4 = 238
	// 2 = 59.5    5 = 476
	// 3 = 119     6 = 952
	this.gyro_sampleRate = 6;
	// gyro cutoff frequency: value between 0-3
	// Actual value of cutoff frequency depends
	// on sample rate.
	this.gyro_bandwidth = 0;
	this.gyro_lowPowerEnable = false;
    this.gyro_HPFEnable = false;
	// Gyro HPF cutoff frequency: value between 0-9
	// Actual value depends on sample rate. Only applies
	// if gyroHPFEnable is true.
	this.gyro_HPFCutoff = 0;
	this.gyro_flipX = false;
	this.gyro_flipY = false;
	this.gyro_flipZ = false;
	this.gyro_orientation = 0;
	this.gyro_latchInterrupt = true;

	this.accel_enabled = true;
	this.accel_enableX = true;
	this.accel_enableY = true;
	this.accel_enableZ = true;
	// accel scale can be 2, 4, 8, or 16
	this.accel_scale = 2;
	// accel sample rate can be 1-6
	// 1 = 10 Hz    4 = 238 Hz
	// 2 = 50 Hz    5 = 476 Hz
	// 3 = 119 Hz   6 = 952 Hz
	this.accel_sampleRate = 6;
	// Accel cutoff freqeuncy can be any value between -1 - 3.
	// -1 = bandwidth determined by sample rate
	// 0 = 408 Hz   2 = 105 Hz
	// 1 = 211 Hz   3 = 50 Hz
	this.accel_bandwidth = -1;
	this.accel_highResEnable = false;
	// accelHighResBandwidth can be any value between 0-3
	// LP cutoff is set to a factor of sample rate
	// 0 = ODR/50    2 = ODR/9
	// 1 = ODR/100   3 = ODR/400
	this.accel_highResBandwidth = 0;

	this.mag_enabled = true;
	// mag scale can be 4, 8, 12, or 16
	this.mag_scale = 4;
	// mag data rate can be 0-7
	// 0 = 0.625 Hz  4 = 10 Hz
	// 1 = 1.25 Hz   5 = 20 Hz
	// 2 = 2.5 Hz    6 = 40 Hz
	// 3 = 5 Hz      7 = 80 Hz
	this.mag_sampleRate = 7;
	this.mag_tempCompensationEnable = false;
	// magPerformance can be any value between 0-3
	// 0 = Low power mode      2 = high performance
	// 1 = medium performance  3 = ultra-high performance
	this.mag_XYPerformance = 3;
	this.mag_ZPerformance = 3;
	this.mag_lowPowerEnable = false;
	// magOperatingMode can be 0-2
	// 0 = continuous conversion
	// 1 = single-conversion
	// 2 = power down
	this.mag_operatingMode = 0;

	this.temp_enabled = true;
	for (var i=0; i<3; i++)
	{
		this.gBias[i] = 0;
		this.aBias[i] = 0;
		this.mBias[i] = 0;
		this.gBiasRaw[i] = 0;
		this.aBiasRaw[i] = 0;
		this.mBiasRaw[i] = 0;
	}
	_autoCalc = false;
};

LSM9DS1.prototype.begin=function(){
 this.constrainScales();
 // Once we have the scale values, we can calculate the resolution
 // of each sensor. That's what these functions are for. One for  each sensor
 this.calcgRes(); // Calculate DPS / ADC tick, stored in gRes variable
 this.calcmRes(); // Calculate Gs / ADC tick, stored in mRes variable
 this.calcaRes(); // Calculate g / ADC tick, stored in aRes variable

  // Now, initialize our hardware interface.
///	if (this.commInterface == IMU_MODE_I2C)	// If we're using I2C
//		initI2C();	// Initialize I2C

 // To verify communication, we can read from the WHO_AM_I register of
	// each device. Store those in a variable so we can return them.
	var mTest = this.mReadByte(Mags.WHO_AM_I_M);		// Read the gyro WHO_AM_I
	var xgTest = this.xgReadByte(Regs.WHO_AM_I_XG);	// Read the accel/mag WHO_AM_I
	var whoAmICombined = (xgTest << 8) | mTest;
console.log("who= ",whoAmICombined);
	if (whoAmICombined != ((WHO_AM_I_AG_RSP << 8) | WHO_AM_I_M_RSP))
		return 0;

	// Gyro initialization stuff:
	this.initGyro();	// This will "turn on" the gyro. Setting up interrupts, etc.

	// Accelerometer initialization stuff:
	this.initAccel(); // "Turn on" all axes of the accel. Set up interrupts, etc.

	// Magnetometer initialization stuff:
	this.initMag(); // "Turn on" all axes of the mag. Set up interrupts, etc.

	// Once everything is initialized, return the WHO_AM_I registers we read:
	return whoAmICombined;
};

LSM9DS1.prototype.constrainScales=function(){
if ((this.gyro_scale != 245) && (this.gyro_scale != 500) &&
 (this.gyro_scale != 2000))this.gyro_scale = 245;

if ((this.accel_scale != 2) && (this.accel_scale != 4) &&
 (this.accel_scale != 8) && (this.accel_scale != 16))
  this.accel._cale = 2;

if ((this.mag_scale != 4) && (this.mag_scale != 8) &&
 (this.mag_scale != 12) && (this.mag_.scale != 16))
  this.mag_scale = 4;
};

LSM9DS1.prototype.calcgRes=function(){
 gRes = this.gyro_scale / 32768.0;
};

LSM9DS1.prototype.calcaRes=function(){
 aRes = this.accel_scale / 32768.0;
};

LSM9DS1.prototype.calcmRes=function(){
	//mRes = ((float) settings.mag.scale) / 32768.0;
	switch (this.mag_scale)
	{
	case 4:
		mRes = magSensitivity[0];
		break;
	case 8:
		mRes = magSensitivity[1];
		break;
	case 12:
		mRes = magSensitivity[2];
		break;
	case 16:
		mRes = magSensitivity[3];
		break;
	}
};

LSM9DS1.prototype.initGyro=function(){
	var tempRegValue = 0;
	// CTRL_REG1_G (Default value: 0x00)
	// [ODR_G2][ODR_G1][ODR_G0][FS_G1][FS_G0][0][BW_G1][BW_G0]
	// ODR_G[2:0] - Output data rate selection
	// FS_G[1:0] - Gyroscope full-scale selection
	// BW_G[1:0] - Gyroscope bandwidth selection
	// To disable gyro, set sample rate bits to 0. We'll only set sample
	// rate if the gyro is enabled.
	if (this.gyro_enabled)
	{
		tempRegValue = (this.gyro_sampleRate & 0x07) << 5;
	}
	switch (this.gyro_scale)
	{
		case 500:
			tempRegValue |= (0x1 << 3);
			break;
		case 2000:
			tempRegValue |= (0x3 << 3);
			break;
		// Otherwise we'll set it to 245 dps (0x0 << 4)
	}
	tempRegValue |= (this.gyro_bandwidth & 0x3);
	this.xgWriteByte(Regs.CTRL_REG1_G, tempRegValue);

	// CTRL_REG2_G (Default value: 0x00)
	// [0][0][0][0][INT_SEL1][INT_SEL0][OUT_SEL1][OUT_SEL0]
	// INT_SEL[1:0] - INT selection configuration
	// OUT_SEL[1:0] - Out selection configuration
	this.xgWriteByte(Regs.CTRL_REG2_G, 0x00);

  // CTRL_REG3_G (Default value: 0x00)
	// [LP_mode][HP_EN][0][0][HPCF3_G][HPCF2_G][HPCF1_G][HPCF0_G]
	// LP_mode - Low-power mode enable (0: disabled, 1: enabled)
	// HP_EN - HPF enable (0:disabled, 1: enabled)
	// HPCF_G[3:0] - HPF cutoff frequency
	tempRegValue =this.gyro_lowPowerEnable ? (1<<7) : 0;
	if (this.gyro_HPFEnable)
	{
		tempRegValue |= (1<<6) | (this.gyro_HPFCutoff & 0x0F);
	}
	this.xgWriteByte(Regs.CTRL_REG3_G, tempRegValue);

	// CTRL_REG4 (Default value: 0x38)
	// [0][0][Zen_G][Yen_G][Xen_G][0][LIR_XL1][4D_XL1]
	// Zen_G - Z-axis output enable (0:disable, 1:enable)
	// Yen_G - Y-axis output enable (0:disable, 1:enable)
	// Xen_G - X-axis output enable (0:disable, 1:enable)
	// LIR_XL1 - Latched interrupt (0:not latched, 1:latched)
	// 4D_XL1 - 4D option on interrupt (0:6D used, 1:4D used)
	tempRegValue = 0;
	if (this.gyro_enableZ) tempRegValue |= (1<<5);
	if (this.gyro_enableY) tempRegValue |= (1<<4);
	if (this.gyro_enableX) tempRegValue |= (1<<3);
	if (this.gyro_latchInterrupt) tempRegValue |= (1<<1);
	this.xgWriteByte(Regs.CTRL_REG4, tempRegValue);

	// ORIENT_CFG_G (Default value: 0x00)
	// [0][0][SignX_G][SignY_G][SignZ_G][Orient_2][Orient_1][Orient_0]
	// SignX_G - Pitch axis (X) angular rate sign (0: positive, 1: negative)
	// Orient [2:0] - Directional user orientation selection
	tempRegValue = 0;
	if (this.gyro_flipX) tempRegValue |= (1<<5);
	if (this.gyro_flipY) tempRegValue |= (1<<4);
	if (this.gyro_flipZ) tempRegValue |= (1<<3);
	this.xgWriteByte(Regs.ORIENT_CFG_G, tempRegValue);
};

LSM9DS1.prototype.initAccel=function(){
	var tempRegValue = 0;

	//	CTRL_REG5_XL (0x1F) (Default value: 0x38)
	//	[DEC_1][DEC_0][Zen_XL][Yen_XL][Zen_XL][0][0][0]
	//	DEC[0:1] - Decimation of accel data on OUT REG and FIFO.
	//		00: None, 01: 2 samples, 10: 4 samples 11: 8 samples
	//	Zen_XL - Z-axis output enabled
	//	Yen_XL - Y-axis output enabled
	//	Xen_XL - X-axis output enabled
	if (this.accel_enableZ) tempRegValue |= (1<<5);
	if (this.accel_enableY) tempRegValue |= (1<<4);
	if (this.accel_enableX) tempRegValue |= (1<<3);

	this.xgWriteByte(Regs.CTRL_REG5_XL, tempRegValue);

	// CTRL_REG6_XL (0x20) (Default value: 0x00)
	// [ODR_XL2][ODR_XL1][ODR_XL0][FS1_XL][FS0_XL][BW_SCAL_ODR][BW_XL1][BW_XL0]
	// ODR_XL[2:0] - Output data rate & power mode selection
	// FS_XL[1:0] - Full-scale selection
	// BW_SCAL_ODR - Bandwidth selection
	// BW_XL[1:0] - Anti-aliasing filter bandwidth selection
	tempRegValue = 0;
	// To disable the accel, set the sampleRate bits to 0.
	if (this.accel_enabled)
	{
		tempRegValue |= (this.accel_sampleRate & 0x07) << 5;
	}
	switch (this.accel_scale)
	{
		case 4:
			tempRegValue |= (0x2 << 3);
			break;
		case 8:
			tempRegValue |= (0x3 << 3);
			break;
		case 16:
			tempRegValue |= (0x1 << 3);
			break;
		// Otherwise it'll be set to 2g (0x0 << 3)
	}
	if (this.accel_bandwidth >= 0)
	{
		tempRegValue |= (1<<2); // Set BW_SCAL_ODR
		tempRegValue |= (this.accel_bandwidth & 0x03);
	}
	this.xgWriteByte(Regs.CTRL_REG6_XL, tempRegValue);

	// CTRL_REG7_XL (0x21) (Default value: 0x00)
	// [HR][DCF1][DCF0][0][0][FDS][0][HPIS1]
	// HR - High resolution mode (0: disable, 1: enable)
	// DCF[1:0] - Digital filter cutoff frequency
	// FDS - Filtered data selection
	// HPIS1 - HPF enabled for interrupt function
	tempRegValue = 0;
	if (this.accel_highResEnable)
	{
		tempRegValue |= (1<<7); // Set HR bit
		tempRegValue |= (this.accel_highResBandwidth & 0x3) << 5;
	}
	this.xgWriteByte(Regs.CTRL_REG7_XL, tempRegValue);
};

LSM9DS1.prototype.initMag=function(){
	var tempRegValue = 0;
	// CTRL_REG1_M (Default value: 0x10)
	// [TEMP_COMP][OM1][OM0][DO2][DO1][DO0][0][ST]
	// TEMP_COMP - Temperature compensation
	// OM[1:0] - X & Y axes op mode selection
	//	00:low-power, 01:medium performance
	//	10: high performance, 11:ultra-high performance
	// DO[2:0] - Output data rate selection
	// ST - Self-test enable
	if (this.mag_tempCompensationEnable) tempRegValue |= (1<<7);
	tempRegValue |= (this.mag_YPerformance & 0x3) << 5;
	tempRegValue |= (this.mag_sampleRate & 0x7) << 2;
	this.mWriteByte(Mags.CTRL_REG1_M, tempRegValue);

	// CTRL_REG2_M (Default value 0x00)
	// [0][FS1][FS0][0][REBOOT][SOFT_RST][0][0]
	// FS[1:0] - Full-scale configuration
	// REBOOT - Reboot memory content (0:normal, 1:reboot)
	// SOFT_RST - Reset config and user registers (0:default, 1:reset)
	tempRegValue = 0;
	switch (this.mag_scale)
	{
	case 8:
		tempRegValue |= (0x1 << 5);
		break;
	case 12:
		tempRegValue |= (0x2 << 5);
		break;
	case 16:
		tempRegValue |= (0x3 << 5);
		break;
	// Otherwise we'll default to 4 gauss (00)
	}
	this.mWriteByte(Mags.CTRL_REG2_M, tempRegValue); // +/-4Gauss

	// CTRL_REG3_M (Default value: 0x03)
	// [I2C_DISABLE][0][LP][0][0][SIM][MD1][MD0]
	// I2C_DISABLE - Disable I2C interace (0:enable, 1:disable)
	// LP - Low-power mode cofiguration (1:enable)
	// SIM - SPI mode selection (0:write-only, 1:read/write enable)
	// MD[1:0] - Operating mode
	//	00:continuous conversion, 01:single-conversion,
	//  10,11: Power-down
	tempRegValue = 0;
	if (this.mag_lowPowerEnable) tempRegValue |= (1<<5);
	tempRegValue |= (this.mag_operatingMode & 0x3);
	this.mWriteByte(Mags.CTRL_REG3_M, tempRegValue); // Continuous conversion mode

	// CTRL_REG4_M (Default value: 0x00)
	// [0][0][0][0][OMZ1][OMZ0][BLE][0]
	// OMZ[1:0] - Z-axis operative mode selection
	//	00:low-power mode, 01:medium performance
	//	10:high performance, 10:ultra-high performance
	// BLE - Big/little endian data
	tempRegValue = 0;
	tempRegValue = (this.mag_ZPerformance & 0x3) << 2;
	this.mWriteByte(Mags.CTRL_REG4_M, tempRegValue);

	// CTRL_REG5_M (Default value: 0x00)
	// [0][BDU][0][0][0][0][0][0]
	// BDU - Block data update for magnetic data
	//	0:continuous, 1:not updated until MSB/LSB are read
	tempRegValue = 0;
	this.mWriteByte(Mags.CTRL_REG5_M, tempRegValue);
};

LSM9DS1.prototype.mWriteByte=function(subAddress,data){
  console.log("mWriteByte ",this.mAddress, subAddress, data);
  var x=this.mAddress;
  this.i2c.writeTo(x, subAddress,data);
  return 0;
};

LSM9DS1.prototype.readAccel=function(){
var temp=this.xgReadBytes(Regs.OUT_X_L_XL, 6); // Read 6 bytes, beginning at OUT_X_L_XL
 this.ax=this.twos_comp(temp[0],temp[1]);
 this.ay=this.twos_comp(temp[2],temp[3]);
 this.az=this.twos_comp(temp[4],temp[5]);
/*
 this.ax = (temp[1] << 8) | temp[0]; // Store x-axis values into ax
 this.ay = (temp[3] << 8) | temp[2]; // Store y-axis values into ay
 this.az = (temp[5] << 8) | temp[4]; // Store z-axis values into az
*/
  if (_autoCalc)
	{
		ax -= aBiasRaw[X_AXIS];
		ay -= aBiasRaw[Y_AXIS];
		az -= aBiasRaw[Z_AXIS];
	}
};

LSM9DS1.prototype.readGyro=function(){
var temp=	this.xgReadBytes(Regs.OUT_X_L_G,6); // Read 6 bytes, beginning at OUT_X_L_G
 this.gx=this.twos_comp(temp[0],temp[1]);
 this.gy=this.twos_comp(temp[2],temp[3]);
 this.gz=this.twos_comp(temp[4],temp[5]);
/*
 this.gx = (temp[1] << 8) | temp[0]; // Store x-axis values into gx
 this.gy = (temp[3] << 8) | temp[2]; // Store y-axis values into gy
 this.gz = (temp[5] << 8) | temp[4]; // Store z-axis values into gz
*/
  if (_autoCalc)
	{
		this.gx -= gBiasRaw[X_AXIS];
		this.gy -= gBiasRaw[Y_AXIS];
		this.gz -= gBiasRaw[Z_AXIS];
	}
};

LSM9DS1.prototype.readMag=function(){
var temp=this.mReadBytes(Mags.OUT_X_L_M, 6); // Read 6 bytes, 	beginning at OUT_X_L_M
 this.mx=this.twos_comp(temp[0],temp[1]);
 this.my=this.twos_comp(temp[2],temp[3]);
 this.mz=this.twos_comp(temp[4],temp[5]);
/*
 this.mx = (temp[1] << 8) | temp[0]; // Store x-axis values into mx
 this.my = (temp[3] << 8) | temp[2]; // Store y-axis values into my
 this.mz = (temp[5] << 8) | temp[4]; // Store z-axis values into mz
*/
};

LSM9DS1.prototype.readTemp=function(){
//void LSM9DS1::readTemp(){
 // We'll read two bytes from the             temperature sensor into temp
var temp=this.xgReadBytes(Regs.OUT_TEMP_L, 2); // Read 2 bytes,     beginning at OUT_TEMP_L
//  console.log("TT= ",temp[0].toString(16),temp[1].toString(16));
this.temperature = temp[1];//(temp[1] << 8) | temp[0];
//temperature = ((int16_t)temp[1] << 8) | temp[0];

//https://gist.github.com/jimblom/08b333892ee383d6e443
//temperature = (((int16_t) temp[1] << 12) | temp[0] << 4 ) >> 4; // Temperature is a 12-bit signed integer
//var t= (((temp[1]^0xf)<<12)|temp[0])>>4;
//this.temperature=(t & 0x8000 ? t - 0x10000 : t);
};
LSM9DS1.prototype.xgReadBytes=function(subAddress,count){
var dest= new Uint8Array(count);
//  console.log("xgReadBytes ",this.xgAddress, subAddress|0x80, dest, count);
  var x=this.xgAddress;
  this.i2c.writeTo(x, subAddress|0x80);
 dest=this.i2c.readFrom(x, count);
//  for(var i=0;i<count;i++)console.log(dest[i]);
  return dest;
};

LSM9DS1.prototype.mReadBytes=function(subAddress,count){
// console.log("mReadBytes ",this.mAddress, subAddress|0x80,count);
  var x=this.mAddress;
  var dest=new Uint8Array(count);
  this.i2c.writeTo(x, subAddress|0x80);
  dest=this.i2c.readFrom(x, count);
//  for(var i=0;i<count;i++)console.log(dest[i]);
  return dest;
};

LSM9DS1.prototype.mReadByte=function(subAddress){
//uint8_t LSM9DS1::mReadByte(uint8_t subAddress)
//		return I2CreadByte(mAddress, subAddress);
  console.log("mReadByte ",this.mAddress.toString(16), subAddress.toString(16));
  var x=this.mAddress;
var data=Uint8Array(1);
  console.log("I2C= ",this.i2c);
 this.i2c.writeTo(x, subAddress);
 data=this.i2c.readFrom(x, 1);
  console.log("data= ",data[0]);
  console.log("I2C= ",this.i2c);
  return data[0];
};

LSM9DS1.prototype.xgReadByte=function(subAddress){
//uint8_t LSM9DS1::xgReadByte(uint8_t subAddress)
 //return I2CreadByte(xgAddress, subAddress);
  console.log("xgReadByte ",this.xgAddress, subAddress);
  var x=this.xgAddress;
  var data=Uint8Array(1);
 this.i2c.writeTo(x, subAddress);
 data=this.i2c.readFrom(x, 1);
  return data[0];
};

LSM9DS1.prototype.xgWriteByte=function(subAddress,data){
  console.log("xgWriteByte ",this.xgAddress, subAddress, data);
  var x=this.xgAddress;
  this.i2c.writeTo(x, subAddress,data);
};

LSM9DS1.prototype.twos_comp=function(low,high){
 var t=(high << 8) | low;
  return(t & 0x8000 ? t - 0x10000 : t);
};
//////////////////////////////////////////////////////////
//Configuration
//The LSM9DS1 I2C register addresses
// SDO_XM and SDO_G are both pulled high, so our addresses are:
var LSM9DS1_M=0x1E; // Would be 0x1C if SDO_M is LOW
var LSM9DS1_AG=0x6B; // Would be 0x6A if SDO_AG is LOW
//LSM9DS1.prototype.init=function(interface,xgAddr,mAddr){
//The I2C pins that the LSM9D01 is connected to
//PICO I2C pins
//IC1  sda=B7  scl=B6
//IC1  sda=B9  scl=B8  shim pins
//IC3  sda=B4  scl=A8
//IC2  sda=B3  scl=B10

function readall (W) {
  W.readAccel();
  W.readGyro();
  W.readMag();
  W.readTemp();
  var pirate=180.0/Math.PI;
  console.log("Acceleration ",W.ax/16384,W.ay/16384,W.az/16384);
  console.log("Gyro         ",W.gx,W.gy,W.gz);
  console.log("Magnetometer ",W.mx,W.my,W.mz);
  console.log("Temperature ",W.temperature);
  console.log("Level", pirate*Math.atan2(W.ax,W.az),pirate*Math.atan2(W.ay,W.az));
  console.log("heading",pirate*Math.atan2(W.mx,W.my));
}

function start () {
  var usage=process.memory().usage;
   I2C1.setup({ scl :B8, sda: B9} );
  var W=new LSM9DS1(I2C1);
  W.init(LSM9DS1_AG,LSM9DS1_M);
  console.log(W.begin());
  var nn=setInterval(function () {
      readall(W);
  }, 200);

  usage=process.memory().usage-usage;
}

start()
