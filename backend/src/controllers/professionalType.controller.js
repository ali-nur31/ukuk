const { ProfessionalType } = require('../models');

// Получить все типы профессионалов
exports.getAllProfessionalTypes = async (req, res) => {
  try {
    const professionalTypes = await ProfessionalType.findAll({
      order: [['name', 'ASC']]
    });

    res.json(professionalTypes);
  } catch (error) {
    console.error('Error getting professional types:', error);
    res.status(500).json({ message: 'Error getting professional types' });
  }
};

// Получить тип профессионала по ID
exports.getProfessionalTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const professionalType = await ProfessionalType.findByPk(id);
    if (!professionalType) {
      return res.status(404).json({ message: 'Professional type not found' });
    }

    res.json(professionalType);
  } catch (error) {
    console.error('Error getting professional type:', error);
    res.status(500).json({ message: 'Error getting professional type' });
  }
};

// Создать новый тип профессионала (только для админов)
exports.createProfessionalType = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    // Проверяем, существует ли уже тип с таким именем
    const existingType = await ProfessionalType.findOne({ where: { name } });
    if (existingType) {
      return res.status(400).json({ message: 'Professional type with this name already exists' });
    }

    const professionalType = await ProfessionalType.create({
      name,
      description,
      icon
    });

    res.status(201).json(professionalType);
  } catch (error) {
    console.error('Error creating professional type:', error);
    res.status(500).json({ message: 'Error creating professional type' });
  }
};

// Обновить тип профессионала (только для админов)
exports.updateProfessionalType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const professionalType = await ProfessionalType.findByPk(id);
    if (!professionalType) {
      return res.status(404).json({ message: 'Professional type not found' });
    }

    // Если меняется имя, проверяем, не существует ли уже тип с таким именем
    if (name && name !== professionalType.name) {
      const existingType = await ProfessionalType.findOne({ where: { name } });
      if (existingType) {
        return res.status(400).json({ message: 'Professional type with this name already exists' });
      }
    }

    await professionalType.update({
      name,
      description,
      icon
    });

    res.json(professionalType);
  } catch (error) {
    console.error('Error updating professional type:', error);
    res.status(500).json({ message: 'Error updating professional type' });
  }
};

// Удалить тип профессионала (только для админов)
exports.deleteProfessionalType = async (req, res) => {
  try {
    const { id } = req.params;

    const professionalType = await ProfessionalType.findByPk(id);
    if (!professionalType) {
      return res.status(404).json({ message: 'Professional type not found' });
    }

    await professionalType.destroy();

    res.json({ message: 'Professional type deleted successfully' });
  } catch (error) {
    console.error('Error deleting professional type:', error);
    res.status(500).json({ message: 'Error deleting professional type' });
  }
}; 