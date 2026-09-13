import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller.js';
import { MoviesService } from './movies.service.js';

describe('MoviesController', () => {
  let controller: MoviesController;

  const moviesServiceMock = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: moviesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
